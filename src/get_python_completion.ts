import * as vscode from "vscode";

import * as path from "path";
import * as cp from "child_process";

type PythonDict = {
    label: string;
    details: {
        type: number;
        package: string;
    };
}[];

export class PyAutoImport implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<
        vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
    > {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);

        const match = /(?<=\s|^|\()\w/.exec(linePrefix);
        if (match) {
            return this.getCompletionList(document);
        }

        return null;
    }

    private getImports(document: vscode.TextDocument): string[] | null {
        return document.getText().match(/(?<=from\s)((?:\w+\.?)+)/g);
    }

    private getPythonCompletionList(document: vscode.TextDocument): Promise<PythonDict> | null {
        const imports = this.getImports(document);
        if (!imports) {
            return null;
        }

        const pyBin = vscode.workspace.getConfiguration("python").get("defaultInterpreterPath");
        const extPath = vscode.extensions.getExtension("virgilsisoe.python-auto-import")
            ?.extensionPath as string;
        const script = path.join(extPath, "scripts", "get_imports.py");

        let result: PythonDict;

        cp.exec(`${pyBin} ${script} ${imports}`, async (err, stdout, stderr) => {
            result = (await JSON.parse(stdout)) as PythonDict;

            if (stderr) {
                console.error("stderr: " + stderr);
                return null;
            }
            if (err) {
                console.error("error: " + err);
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

            element.detail = "Auto-Import";
            element.documentation = item.details.package;

            // XXX: I should be able to pass a list of arguments to element.arguments
            // But It does not work
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
