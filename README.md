# Python Auto Import README

Suggest auto import for third-party modules based on modules already imported for Visual Studio Code.

![Demo](/resources/demo.gif)

## Disclaimer

This feature used to be part of VS Code-Pylance but currently does not work anymore.
So while waiting for some updates to fix it/bring it back, I made my own extension as a quick workaround.

This is to let you know that, this extension, is just a "quick patch" and might not cover every case (at least for now).

## Usage

- Inside the `.vscode/settings.json`, the setting `python.defaultInterpreterPath` must be set with the Python interpreter which has access to the environment libraries.

![path](/resources/path.jpg)

### NOTE

  1. If you don't set `python.defaultInterpreterPath`, the extension will get the OS base `python` interpreter (which usually does not have access to specific third-party libraries).
  2. Even if your workspace has currently detected the proper Python interpreter, the extension still needs the full path of it, and the only way I am aware on how to get it, is from `python.defaultInterpreterPath`.

## Difference from Pylance

The extension offers import suggestions only after a `from module import` statement is present inside the file, while Pylance is much broader (albeit currently not working for third-party modules).

There suggestion are also shown slightly different, so if there is a problem, you know who to blame.

- Pylance

    ![Pylance](/resources/pylance.jpg)

- Extension

    ![Extension](/resources/extension.jpg)
