# Python Auto Import README

Suggest auto import for third-party modules based on modules already imported for Visual Studio Code.

![Demo](/resources/demo.gif)

## Disclaimer

This feature used to be part of VS Code-Pylance but currently does not work anymore.
So while waiting for some updates to fix it/bring it back, I made my own extension as a quick workaround.

This is to let you know that this extension, is just a "quick hack" and might not cover every case (at least for now).

## Usage

- From the **Workspace** or **Folder** settings, set `python.defaultInterpreterPath` to a valid Python interpreter which has access to the environment libraries.
- Then after you write a `from module import` statement, you should see the modules suggestions based on those imports.

![path](/resources/setting.jpg)

### NOTE

  1. If not manually changed, most of the times, `python.defaultInterpreterPath` will default to the
    OS base `python` interpreter. This allows the extension to work without problems, but will likely not suggest the specific third-party libraries.
  2. Even if your workspace has currently detected the proper Python interpreter,
    the extension still needs the full path of it, and the only way I am aware on how to get it, is from `python.defaultInterpreterPath`.

## Differences from Pylance

The extension offers import suggestions only after a `from module import` statement is present inside the file, while Pylance is much broader (albeit currently not working for third-party modules).

The suggestion hints are also shown slightly different, so if there is a problem, you know who to blame.

- Pylance

    ![Pylance](/resources/pylance.jpg)

- Extension

    ![Extension](/resources/extension.jpg)

## Notes

- There is an output window which I use for debugging as in some rare occasions,
the extension does not work outside the testing environments and I need to figure out why.
