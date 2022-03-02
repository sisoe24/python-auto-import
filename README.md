# python-auto-import README

Suggest auto import modules based on modules already imported.

## Disclaimer

This feature used to be part of VS Code but for some reason it does not work anymore.
I have asked around but still no response. Because I had a day off, I made my own extension
as a workaround.

This extension is really a quick hack to make the auto import available and is not fully tested yet.

## Requirements

The setting: `python.defaultInterpreterPath` must be set with the python interpreter for the workspace.
Otherwise the extension will used the default base OS `python` interpreter (which usually won't have access to all of the third party libraries).
