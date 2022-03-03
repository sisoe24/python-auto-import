import * as vscode from "vscode";

import * as path from "path";
import * as cp from "child_process";

type PythonCompletionDict = {
    label: string;
    details: {
        type: number;
        package: string;
    };
}[];

export class PyCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<
        vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
    > {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);

        // Don't suggest when inline import statement
        if (/(from|import)/.test(linePrefix)) {
            return null;
        }

        // Don't suggest if is part of an `from x import ()` statement
        const textTillCursor = document.getText(
            new vscode.Range(0, 0, position.line, position.character)
        );
        const hoverWord = document.getText(document.getWordRangeAtPosition(position));
        if (!RegExp(`from.+?\\).+${hoverWord}`, "s").test(textTillCursor)) {
            return null;
        }

        //When word starts at beginning, space or inside parenthesis
        if (/(?<=\s|^|\()\w/.exec(linePrefix)) {
            return this.getCompletionList(document);
        }

        return null;
    }

    private getImports(document: vscode.TextDocument): string[] | null {
        return document.getText().match(/(?<=from\s)((?:\w+\.?)+)/g);
    }

    private getPythonCompletionList(
        document: vscode.TextDocument
    ): Promise<PythonCompletionDict> | null {
        const imports = this.getImports(document);
        // console.log("🚀 ~ imports", imports);

        if (!imports) {
            return null;
        }

        const pyBin = vscode.workspace.getConfiguration("python").get("defaultInterpreterPath");
        const extPath = vscode.extensions.getExtension("virgilsisoe.python-auto-import")
            ?.extensionPath as string;
        const script = path.join(extPath, "scripts", "get_imports.py");

        let result: PythonCompletionDict;

        cp.exec(`${pyBin} ${script} ${imports}`, async (err, stdout, stderr) => {
            // console.log("🚀 ~ stdout", stdout);
            result = (await JSON.parse(stdout)) as PythonCompletionDict;

            if (stderr) {
                vscode.window.showErrorMessage(stderr);
                return null;
            }
            if (err) {
                vscode.window.showErrorMessage(err.message);
                return null;
            }
        });
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(result);
            }, 200);
        });
    }

    private async getCompletionList(document: vscode.TextDocument) {
        const pythonCompletionList = await this.getPythonCompletionList(document);
        if (!pythonCompletionList) {
            return null;
        }

        const items: vscode.CompletionItem[] = [];
        for (const item of pythonCompletionList) {
            if (document.getText().match(item.label)) {
                continue;
            }
            const element = new vscode.CompletionItem(item.label, item.details.type);

            const markdownDoc = new vscode.MarkdownString();
            markdownDoc.appendCodeblock(`from ${item.details.package} import ${item.label}`);
            element.documentation = markdownDoc;
            element.detail = "Python-Auto-Import";

            // XXX: I should be able to pass a list to element.arguments but It does not work
            // So I am passing a string to be splitted by the comma.
            element.command = {
                command: "python-auto-import.autoImport",
                title: "Python Auto Import Command",
                arguments: [`${item.label}, ${item.details.package}`],
            };
            items.push(element);
        }

        return items;
    }
}
