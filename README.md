[![vscode-marketplace](https://img.shields.io/badge/vscode-marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.python-auto-import)
[![vscode-version](https://img.shields.io/visual-studio-marketplace/v/virgilsisoe.python-auto-import)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.python-auto-import&ssr=false#version-history)
[![vscode-installs](https://img.shields.io/visual-studio-marketplace/i/virgilsisoe.python-auto-import)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.python-auto-import)
[![vscode-ratings](https://img.shields.io/visual-studio-marketplace/r/virgilsisoe.python-auto-import)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.python-auto-import&ssr=false#review-details)
[![vscode-last-update](https://img.shields.io/visual-studio-marketplace/last-updated/virgilsisoe.python-auto-import)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.python-auto-import)

[![openvsx-marketplace](https://img.shields.io/badge/openvsx-marketplace-C160EF)](https://open-vsx.org/extension/virgilsisoe/python-auto-import)
[![openvsx-version](https://img.shields.io/open-vsx/v/virgilsisoe/python-auto-import?label=version)](https://open-vsx.org/extension/virgilsisoe/python-auto-import/changes)
[![openvsx-downloads](https://img.shields.io/open-vsx/dt/virgilsisoe/python-auto-import)](https://open-vsx.org/extension/virgilsisoe/python-auto-import)
[![openvsx-rating](https://img.shields.io/open-vsx/rating/virgilsisoe/python-auto-import)](https://open-vsx.org/extension/virgilsisoe/python-auto-import/reviews)

# Python Auto Import README

Auto-import suggestions for modules already imported in Visual Studio Code.

---

**NOTE**: They have added back this feature to one of latests version of Pylance, so you can uninstall this extension if you are using Pylance.

---

## Disclaimer

![Demo](/resources/demo.gif)
This feature used to be part of VS Code-Pylance but currently does not work anymore.
And while waiting for some updates to fix it/bring it back, I made my extension as a quick workaround.

So, this is to let you know that this extension is just a "quick hack" and might not cover every case.

## Usage

To use the extension, you need to set the python interpreter path to one that has access to the third-party libraries you intend to use in your workspace.

You can set the path in two ways

1. Using the extension configuration `pythonAutoImport.python`.
2. Using the vscode configuration `python.defaultInterpreterPath`.

> Note that the extension configuration will override the vscode configuration.

Then after you write a `from module import` statement, you should see the modules suggestions based on those imports.

![path](/resources/setting2.jpg)

### NOTE

  1. If not manually changed, most of the time, `python.defaultInterpreterPath` will default to the
    OS base `python` interpreter. So the extension will work but will likely not suggest specific third-party libraries.
  2. Even if your workspace has detected the proper Python interpreter, the extension still needs its path. And the only way I am aware of how to get it is from the settings.

## Differences from Pylance

The extension offers import suggestions only after a `from module import` statement is present inside the file, while Pylance is much broader (albeit currently not working for third-party modules).

Also, the suggestion hints are displayed slightly differently.

- Pylance

    ![Pylance](/resources/pylance.jpg)

- Extension

    ![Extension](/resources/extension.jpg)

## Notes

- There is an output window that I use for debugging.
