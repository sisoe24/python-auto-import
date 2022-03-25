import * as vscode from "vscode";

import * as path from "path";
import * as cp from "child_process";
import { existsSync } from "fs";

type PythonCompletionDict = {
    label: string;
    details: {
        type: number;
        package: string;
    };
}[];

const outputWindow = vscode.window.createOutputChannel("python-auto-import");

/**
 * Internal debug function.
 *
 * @param value msg to append in console
 */
function debug(value: string) {
    const _debug = true;
    if (_debug) {
        outputWindow.appendLine(`-> ${value}`);
    }
}

export class PyCompletionProvider implements vscode.CompletionItemProvider {
    imports: string[] | null = [];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<
        vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
    > {
        outputWindow.clear();
        debug("-*- Start provider -*-");

        this.imports = this.getAllImports(document);
        if (!this.imports) {
            debug("No imports found. Abort");
            return null;
        }

        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        debug("LinePrefix: " + linePrefix.trim());

        // Don't suggest when inline import statement
        if (/(from|import)/.test(linePrefix)) {
            debug("Cursor position is in a inline import statement. Dont suggest");
            return null;
        }

        const ranges = this.getParenthesisRange(document);
        if (ranges) {
            const cursorPositionIndex = document.offsetAt(
                new vscode.Position(position.line, position.character)
            );
            debug("Cursor position: " + cursorPositionIndex);

            for (const range of ranges) {
                const insideStatement = (n: number) => {
                    return n >= range[0] && n <= range[1];
                };
                if (insideStatement(cursorPositionIndex)) {
                    debug("Cursor position is inside a from import statement. Dont suggest");
                    return null;
                }
            }
        }

        // Suggest when word starts at beginning, space or inside parenthesis
        if (/(?<=\s|^|\()\w$/.exec(linePrefix)) {
            debug("Start suggesting");
            return this.getCompletionList(document);
        }

        debug("No condition was matched. Abort and dont suggest");

        return null;
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
     * Get all of the import statement ranges to check if cursor is inside.
     * If is inside then do not suggest because it will create duplicates
     *
     * @param document vscode editor document object
     * @returns a list of list of ranges `[[start, end], [start, end]]` if found or an empty list
     * if no range was found.
     */
    private getParenthesisRange(document: vscode.TextDocument) {
        const regex = RegExp("from\\s+[^\\s]+\\s+import\\s+\\(.+?\\)", "gs");

        const indexPairs = [];
        const text = document.getText();

        let matchArr: RegExpExecArray | null;
        while (null !== (matchArr = regex.exec(text))) {
            debug(
                `import on multiple line. range: ${[
                    matchArr.index,
                    regex.lastIndex,
                ]} - ${JSON.stringify(matchArr)}`
            );
            indexPairs.push([matchArr.index, regex.lastIndex]);
        }

        return indexPairs;
    }

    /**
     * Get the python completion list elements.
     *
     * The completion list is created by executing a shell command invoking a
     * python script which will then print the result on stdout.
     *
     * @returns a PythonCompletionDict object or null if none are found.
     */
    private getPythonCompletionList(): Promise<PythonCompletionDict> | null {
        const pyBin = vscode.workspace
            .getConfiguration("python")
            .get("defaultInterpreterPath") as string;
        debug(`Python binary is custom path: ${existsSync(pyBin)} - path: ${pyBin}`);

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
            }, 200); // XXX: a lower value might not work
        });
    }

    /**
     * Create a list of already imported modules inside the current file.
     *
     * This is needed to avoid suggesting modules already imported.
     *
     * @param document vscode editor document object
     * @returns a list of strings with the modules imported
     */
    private alreadyImportedModules(document: vscode.TextDocument): string[] {
        const documentText = document.getText();
        function findImports(regex: RegExp) {
            let matchArr: RegExpExecArray | null;
            while (null !== (matchArr = regex.exec(documentText))) {
                // some regex will match: `foo, bar` so need to split and trim
                for (const module of matchArr[1].split(",")) {
                    importedModulesList.push(module.trim());
                }
            }
        }

        const importedModulesList: string[] = [];

        // get inline imports
        findImports(RegExp("import\\s+([a-z].+)", "gmi"));

        // get imports on multiple lines
        findImports(RegExp("from\\s+[^\\s]+\\s+import\\s+\\((.+?)\\)", "gs"));

        return importedModulesList;
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
        const pythonCompletionList = await this.getPythonCompletionList();
        debug("Python completion list: " + JSON.stringify(pythonCompletionList));

        if (!pythonCompletionList) {
            debug("List empty. Abort.");
            return null;
        }

        const items: vscode.CompletionItem[] = [];
        const importedModules = this.alreadyImportedModules(document);

        for (const item of pythonCompletionList) {
            if (importedModules.includes(item.label)) {
                debug(`Item already imported: ${item.label}. Skipping`);
                continue;
            }
            const element = new vscode.CompletionItem(item.label, item.details.type);

            const markdownDoc = new vscode.MarkdownString();
            markdownDoc.appendCodeblock(`from ${item.details.package} import ${item.label}`);
            element.documentation = markdownDoc;
            element.detail = "Python-Auto-Import";

            // I should be able to pass a list to element.arguments but the function
            // receiver gets only the first argument.
            // So I am passing a string to be splitted by the comma.
            element.command = {
                command: "python-auto-import.autoImport",
                title: "Python Auto Import Command",
                arguments: [`${item.label}, ${item.details.package}`],
            };
            items.push(element);
        }

        debug("Vscode completion items: " + JSON.stringify(items));

        return items;
    }
}
