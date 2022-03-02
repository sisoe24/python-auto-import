# Python Auto Import README

Suggest auto import for third-party modules based on modules already imported for Visual Studio Code.

![Demo](https://raw.githubusercontent.com/sisoe24/python-auto-import/main/resources/Demo.gif)

## Disclaimer

This feature used to be part of VS Code-Plyance but for some reason it does not work anymore.
I have asked around but still no response, so in the meantime, I made my own extension
as a workaround.

So keep in mind that this extension is pretty rough around the edges and is not meant to cover every possible case (for now), as VS Code might introduce back the functionality.

## Requirements

The setting: `python.defaultInterpreterPath` must be set with the Python interpreter for the environment.
If the setting is not set, the extension will still grab the settings value but what will get is the default base OS `python` interpreter (which usually won't have access to all of the third party libraries).

**NOTE**: even if your workspace has currently detected the proper Python interpreter, the extension still needs the full path for it, and the only way that I know of, is by getting the value from `python.defaultInterpreterPath`.

## Difference from Pylance

The extension attempts imports only from a `from module import` statement, while Pylance
is much broader (albeit currently not working for third-party modules).

There suggestion are also shown slightly different:

Pylance

![Pylance](https://raw.githubusercontent.com/sisoe24/python-auto-import/main/resources/pylance.jpg)

Extension

![Extension](https://raw.githubusercontent.com/sisoe24/python-auto-import/main/resources/extension.jpg)

So if there is a problem, you know who to blame  🤭