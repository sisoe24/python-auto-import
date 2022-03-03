import sys
import json
import inspect
import importlib


class CompletionItemKind:
    """VS Code CompletionItemKind constants."""

    Text = 0
    Method = 1
    Function = 2
    Constructor = 3
    Field = 4
    Variable = 5
    Class = 6
    Interface = 7
    Module = 8
    Property = 9
    Unit = 10
    Value = 11
    Enum = 12
    Keyword = 13
    Snippet = 14
    Color = 15
    File = 16
    Reference = 17
    Folder = 18
    EnumMember = 19
    Constant = 20
    Struct = 21
    Event = 22
    Operator = 23
    TypeParameter = 24
    User = 25
    Issue = 26


COMPLETIONS = []


def append_object(label, kind, package):
    """Append object to completions list.

    Args:
        label (str): the name of object.
        kind (str): the kind of object (class, function).
        package (str): the parent package.
    """
    COMPLETIONS.append(
        {'label': label, 'details': {'type': kind, "package": package}}
    )


def create_completions(module):
    """Create the completions list.

    Currently not all the object types are matched compared to the vscode
    completion item kinds.

    Args:
        module (module): the module to inspect for its objects.
    """
    package = module.__name__

    for obj in dir(module):
        if obj.startswith('_'):
            continue

        attr = getattr(module, obj)

        if inspect.isclass(attr):
            append_object(obj, CompletionItemKind.Class, package)

        elif inspect.ismethod(attr) or inspect.isbuiltin(attr):
            append_object(obj, CompletionItemKind.Method, package)

        elif inspect.isfunction(attr):
            append_object(obj, CompletionItemKind.Function, package)

        elif inspect.ismodule(attr):
            append_object(obj, CompletionItemKind.Module, package)

        elif type(obj) in (float, int, str, list, tuple, set, dict):
            append_object(obj, CompletionItemKind.Variable, package)

        else:
            append_object(obj, CompletionItemKind.Value, package)


_, *args = sys.argv

# the modules are sended inside a stringified list '[foo, bar]'
modules = args[0].split(',')

for arg in modules:
    try:
        module = importlib.import_module(arg)
    except ModuleNotFoundError:
        pass
    else:
        create_completions(module)

# This is used to end to stdout
print(json.dumps(COMPLETIONS or ""))
