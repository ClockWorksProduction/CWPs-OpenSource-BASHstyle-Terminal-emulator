# API Reference

This document provides a detailed reference for the core API of the CWP Open Terminal Emulator, designed for third-party developers looking to integrate, extend, or build upon the library.

---

## Core Architecture

The terminal is composed of several key modules that work together:

1.  **`core`**: Contains the primary, top-level classes that orchestrate all operations. `CentralTerminal` is the main entry point, `TerminalUI` manages the DOM, and `terminal.js` provides core utilities.
2.  **`boot`**: Manages the boot sequence. `BootHandler` runs all the checks, `BootCheck` represents a single check, and `BootCheckRegistry` is where you can add your own custom checks.
3.  **`vfs`**: The Virtual File System. `VOS` provides the main API, while `VFile` and `VDirectory` represent files and directories.
4.  **`addons`**: The addon system. `Addon` is the base class for creating new addons, and `AddonExecutor` manages their lifecycle.

---

## `CentralTerminal`

**Source:** `src/core/central-terminal.js`

The main class that you will instantiate. It binds everything together.

### `constructor(containerOrUI)`

Creates a new terminal instance. The constructor is flexible:

*   **Simple Mode**: Pass a CSS selector string (e.g., `'#my-terminal'`). The library will automatically build the required DOM elements inside that container.

*   **Advanced Mode**: Pass a `TerminalUI` instance for fine-grained control over the DOM. (See the `TerminalUI` section).

### Key Properties

*   `vOS` (`VOS`): The virtual file system instance. Use this to programmatically interact with the FS.
*   `addonExecutor` (`AddonExecutor`): The addon manager. Use this to register your custom addons.
*   `bootRegistry` (`BootCheckRegistry`): The boot sequence manager. Use this to add custom boot checks.

### Methods

*   `async boot()`: Starts the terminal. This initializes the UI, runs all registered boot checks, loads saved sessions from `localStorage`, and displays the welcome message.
*   `registerAddon(addonInstance)`: Registers an `Addon` instance with the `addonExecutor`.
*   `async runCommand(commandString)`: Programmatically executes a command string as if the user had typed it.
*   `clear()`: Clears all visible output from the terminal screen.

---

## `TerminalUI`

**Source:** `src/core/terminal-ui.js`

Handles all interaction with the DOM. You can let `CentralTerminal` create it for you or instantiate it yourself for more complex integrations.

### `constructor(containerSelector, onCommand, onAutocomplete, options)`

*   `containerSelector` (String): The CSS selector for the main container element.
*   `onCommand` (Function): The callback function to execute when the user enters a command.
*   `onAutocomplete` (Function): The callback for handling `Tab` completion.
*   `options` (Object): An optional object to map to existing DOM elements:
    *   `outputSelector` (String): CSS selector for the element that will display command output.
    *   `promptSelector` (String): CSS selector for the element displaying the prompt (e.g., `$ `).
    *   `inputSelector` (String): CSS selector for the `<input>` element.

---

## `VOS` (Virtual Operating System)

**Source:** `src/vfs/vos.js`

Provides the API for interacting with the virtual file system. An instance is available at `CentralTerminal.vOS`.

### File & Directory Operations

*   `writeFile(path, content, ftype, overwrite)`: Creates or updates a file. `ftype` is an optional string (e.g., `'text'`). `overwrite` defaults to `true`.
*   `readFile(path)`: Returns the content of a file as a string, or `null` if it doesn't exist.
*   `unlink(path)`: Deletes a file. Returns `true` on success.
*   `mkdir(path)`: Creates a new directory. For recursive creation, use `_mkdirp(path)` (internal method).
*   `rmdir(path)`: Removes an empty directory.
*   `ls(path)`: Returns an array of names for files and directories at a given path.
*   `chdir(path)`: Changes the current working directory.

### Path Manipulation

*   `normalize(path)`: Resolves a path to its absolute form, handling `.` , `..`, and `~` (home directory).
*   `resolve(path)`: Resolves a path to its corresponding `VFile` or `VDirectory` object, or `null` if it doesn't exist.
*   `parentOf(path)`: Returns the `VDirectory` object of the parent.
*   `pathOf(node)`: Returns the full string path of a given `VFile` or `VDirectory` object.

---

## Addon System

Addons are self-contained modules that can be launched from the main terminal. When an addon is active, it takes over the input loop, allowing for a custom set of commands.

### `Addon` (Base Class)

**Source:** `src/addons/addon.js`

All addons must extend the `Addon` base class.

#### `constructor(options)`

The constructor accepts an `options` object with two key properties:

*   `name` (String): The invocation name for the addon.
*   `isTopLevel` (Boolean): If `true`, the addon is launched by its `name` directly (e.g., `edit`). If `false` (or omitted), it is launched as a subcommand of `run` (e.g., `run myaddon`).

#### Lifecycle Methods

*   `onStart(args)`: Called when the addon is started. `args` is an array of any arguments passed to the invocation command.
*   `onStop()`: Called when the addon is exited (typically via the `exit` command). Use this for cleanup.

#### Input Handling

*   `handleCommand(input)`: This method is called for every line of user input while the addon is active.

#### Addon-Specific Commands

*   `addCommand(name, description, executeFn)`: Defines a command that is only available when the addon is running.

*   `exit()`: A built-in method that stops the addon and returns control to the main terminal.

### Example: Registering Different Addon Types

```javascript
import { CentralTerminal } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/core/central-terminal.js''';
import { Addon } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/addons/addon.js''';

// 1. A standard addon launched with 'run notepad'
class NotepadAddon extends Addon {
    constructor() {
        super({ name: 'notepad' }); // isTopLevel defaults to false
    }
    // ... implementation
}

// 2. A top-level addon launched with 'myeditor'
class EditorAddon extends Addon {
    constructor() {
        super({ name: 'myeditor', isTopLevel: true });
    }
    // ... implementation
}

// Registering the addons
const term = new CentralTerminal('#terminal-container');
term.registerAddon(new NotepadAddon());
term.registerAddon(new EditorAddon());
```

---

## Boot Sequence

The boot sequence runs diagnostics before the terminal starts. You can add your own checks.

### `BootCheck`

**Source:** `src/boot/boot-check.js`

This class represents a single check.

*   `constructor(name, fn, description)`:
    *   `name` (String): The name of the check displayed during boot.
    *   `fn` (Function): An async function that performs the check. It should return `true` for success and `false` for failure.

### `BootCheckRegistry`

**Source:** `src/boot/boot-check-registry.js`

Accessed via `CentralTerminal.bootRegistry`.

*   `add(check)`: Use this method to add a new `BootCheck` instance to the boot sequence.

### Example: Adding a Custom Boot Check

```javascript
import { CentralTerminal } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/core/central-terminal.js''';
import { BootCheck } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/boot/boot-check.js''';

const term = new CentralTerminal('#terminal-container');

const myCheck = new BootCheck(
  'Checking for custom API',
  async () => {
    // Replace with a real check
    const response = await fetch('https://api.example.com/status');
    return response.ok;
  }
);

term.bootRegistry.add(myCheck);

term.boot(); // The custom check will run on boot
```
