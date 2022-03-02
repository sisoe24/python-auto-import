import * as vscode from "vscode";
import { PyAutoImport } from "./get_python_completion";
import { insertImport } from "./insert_import";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider("python", new PyAutoImport())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("python-auto-import.autoImport", (args) => {
            if (args) {
                insertImport(args);
            }
        })
    );
}

export function deactivate() {}
