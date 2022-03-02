# Python Auto Import README

Suggest auto import for third-party modules based on modules already imported for Visual Studio Code.

## Disclaimer

This feature used to be part of VS Code-Plyance but for some reason it does not work anymore.
I have asked around but still no response, so in the meantime, I made my own extension
as a workaround.

So keep in mind that this extension is pretty rough around the edges and is not meant to cover every possible case (for now), as might they might introduce back the functionality.

## Requirements

The setting: `python.defaultInterpreterPath` must be set with the Python interpreter for the workspace.
If the setting is not set, the extension will still call the settings and will get the default base OS `python` interpreter (which usually won't have access to all of the third party libraries).

**NOTE**: even if your workspace has currently detected the proper Python interpreter, the extension still needs the full path for it, and the only way that I know of, is by getting the value from `python.defaultInterpreterPath`.

## Difference from Pylance

The extension attempts imports only from a `from module import` statement, while Pylance
is much broader (albeit currently not working for third-party modules).

There suggestion are also shown different:

Pylance

![Pylance](/resources/pylance.jpg)

Extension

![Extension](/resources/extension.jpg)

So if there is a problem, you know who to blame  🤭

## Demo

![Demo](/resources/demo.gif)
