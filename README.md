# Python Auto Import README

Suggest auto import for third-party modules based on modules already imported for Visual Studio Code.

![Demo](/resources/demo.gif)

## Disclaimer

This feature used to be part of VS Code-Pylance but currently does not work anymore.
And while waiting for some updates to fix it/bring it back, I made my extension as a quick workaround.

So, this is to let you know that this extension is just a "quick hack" and might not cover every case (at least for now).

## Usage

- After installing the extension, from the Workspace or Folder settings, set `python.defaultInterpreterPath` value to a valid Python interpreter path. The path should be the one that has access to the environment libraries used in your workspace.
- Then after you write a `from module import` statement, you should see the modules suggestions based on those imports.

![path](/resources/setting.jpg)

### NOTE

  1. If not manually changed, most of the time, `python.defaultInterpreterPath` will default to the
    OS base `python` interpreter. So the extension will work without problems but will likely not suggest specific third-party libraries.
  2. Even if your workspace has detected the proper Python interpreter, the extension still needs its path. And the only way I am aware of how to get it is from `python.defaultInterpreterPath`.

## Differences from Pylance

The extension offers import suggestions only after a `from module import` statement is present inside the file, while Pylance is much broader (albeit currently not working for third-party modules).

Also, the suggestion hints are displayed slightly differently.

- Pylance

    ![Pylance](/resources/pylance.jpg)

- Extension

    ![Extension](/resources/extension.jpg)

## Notes

- There is an output window that I use for debugging.
