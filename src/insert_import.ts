import * as vscode from "vscode";

export function insertImport(args: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return null;
    }
    const splitArgs = args.split(",");
    const module = splitArgs[0];
    const parent = splitArgs[1];

    const document = editor.document;
    let docText = document.getText();
    let lineWasAdded = false;

    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;

        if (line.match(parent)) {
            let replaceRegex: RegExp;
            let replaceString: string;

            if (/\(/.test(line)) {
                replaceRegex = RegExp(`\(?<=${parent}\.+\\(\)`);
                replaceString = `\n    ${module},`;
                lineWasAdded = true;
            } else {
                replaceRegex = RegExp(`\(?<=${parent}\\simport\\s\)`);
                replaceString = `${module}, `;
            }

            docText = docText.replace(replaceRegex, replaceString);
        }
    }

    const position = editor.selection.active;

    editor.edit((editBuilder) => {
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
        editBuilder.replace(textRange, docText);
    });

    // need to se back the cursor after modifying the document
    const line = lineWasAdded ? position.line + 1 : position.line;
    const newPosition = position.with(line, position.character);
    const newSelection = new vscode.Selection(newPosition, newPosition);
    editor.selection = newSelection;
}
