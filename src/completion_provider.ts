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
    imports: string[] | null = [];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<
        vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
    > {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        // console.log("🚀 ~ Start provider:", linePrefix);

        this.imports = this.getAllImports(document);
        if (!this.imports) {
            // console.log("No imports found so no suggestion");
            return null;
        }

        // Don't suggest when inline import statement
        if (/(from|import)/.test(linePrefix)) {
            // console.log("Don't suggest when inline import statement");
            return null;
        }

        // Don't suggest if is part of an `from x import ()` statement
        const parenthesisImports = this.getParenthesisImports(document);
        if (parenthesisImports) {
            const line = position.line;
            const ranges = this.getImportsRange(document, parenthesisImports.length);

            for (const range of ranges) {
                const insideStatement = (n: number) => {
                    return n >= range[0] && n <= range[1];
                };
                if (insideStatement(line)) {
                    // console.log("dont suggest. cursor is inside statement");
                    return null;
                }
            }
        }

        // Suggest when word starts at beginning, space or inside parenthesis
        if (/(?<=\s|^|\()\w$/.exec(linePrefix)) {
            // console.log("Start suggesting");
            return this.getCompletionList(document);
        }

        return null;
    }

    /**
     * Get all of the import statement ranges to check if cursor is inside.
     * If is inside then do not suggest because it will create duplicates
     *
     * @param document vscode editor document object
     * @returns a list of list of ranges `[[start, end], [start, end]]` if found or an empty list
     * if no range was found.
     */
    private getImportsRange(document: vscode.TextDocument, numImports: number) {
        const ranges: any[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const lineText = line.text;

            let startLine = 0;

            if (/from.+?\(/.test(lineText)) {
                startLine = line.lineNumber;
            }

            if (lineText.endsWith(")")) {
                ranges.push([startLine, line.lineNumber]);

                if (ranges.length >= numImports) {
                    break;
                }
            }
        }

        return ranges;
    }

    /**
     * Get all `from x import y` statements present in document.
     * 
     * This will also include the `from x import (y)`.
     * 
     * @param document vscode document object
     * @returns a string with the base identifier or null if no match is found.
     */
    private getAllImports(document: vscode.TextDocument): string[] | null {
        return document.getText().match(/(?<=from\s)((?:\w+\.?)+)/g);
    }
    
    /**
     * Get only the `from x import (y)` statements present in document.
     * 
     * @param document vscode document object
     * @returns a string with the base identifier or null if no match is found.
     */
    private getParenthesisImports(document: vscode.TextDocument): string[] | null {
        return document.getText().match(/from.+?\(/g);
    }

    /**
     * Get the python completion list elements.
     * 
     * The completion list is created by executing a shell command invoking a
     * python script which will then print the result on stdout.
     * 
     * @param document vscode document object.
     * @returns a PythonCompletionDict object or null if none are found.
     */
    private getPythonCompletionList(
        document: vscode.TextDocument
    ): Promise<PythonCompletionDict> | null {
        const pyBin = vscode.workspace.getConfiguration("python").get("defaultInterpreterPath");
        const extPath = vscode.extensions.getExtension("virgilsisoe.python-auto-import")
            ?.extensionPath as string;
        const script = path.join(extPath, "scripts", "get_imports.py");

        let result: PythonCompletionDict;

        cp.exec(`${pyBin} ${script} ${this.imports}`, async (err, stdout, stderr) => {
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

    /**
     * Generate the completion items suggestion for the provider.
     * 
     * Each completion item is bound to a command which will trigger the command
     * to insert its value inside the `from import` statements.
     * 
     * @param document vscode document object
     * @returns the completion items list or null
     */
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

            // I should be able to pass a list to element.arguments but It does not work
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
