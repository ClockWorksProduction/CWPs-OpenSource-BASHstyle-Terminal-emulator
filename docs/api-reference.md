# API Reference

This document provides a detailed reference for the core API of the CWP Open Terminal Emulator, designed for third-party developers looking to integrate, extend, or build upon the library.

---

## Core Architecture

The terminal is composed of several key classes that work together:

1.  **`CentralTerminal`**: The primary, top-level class that orchestrates all operations. It manages commands, addons, and the user session.
2.  **`TerminalUI`**: A handler that manages all DOM interactions, including input, output, and rendering. It can be automatically generated or mapped to your existing HTML structure.
3.  **`VOS` (Virtual Operating System)**: An in-memory virtual file system that simulates a POSIX-like environment with files and directories.
4.  **`AddonExecutor`**: A manager responsible for the lifecycle of addons.
5.  **`BootCheckRegistry`**: A system that runs diagnostic and setup tasks before the terminal is ready for user input.

---

## `CentralTerminal`

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

Addons are self-contained modules that can be launched from the main terminal.

### `Addon` (Base Class)

Create a new class that extends `Addon`.

#### `constructor(name)`

*   `name` (String): The command used to launch your addon (e.g., `run my_addon`).

#### Lifecycle Methods

*   `onStart(args)`: Called when the addon is started. `args` is an array of any arguments passed to the `run` command. Use this to set up your addon's initial state and UI.
*   `onStop()`: Called when the addon is exited (e.g., via the `exit` command). Use this for cleanup.

#### Input Handling

*   `handleCommand(input)`: This method is called for every line of user input while the addon is active. You are responsible for parsing and handling the input.

#### Addon-Specific Commands

*   `addCommand(name, description, executeFn)`: Within your addon's constructor or `onStart` method, you can define a set of commands that are only available when your addon is running.

*   `exit()`: A built-in method that stops the addon and returns control to the main terminal.

---

## Boot Sequence

The boot sequence runs diagnostics before the terminal starts. You can add your own checks.

### `BootCheck`

This class represents a single check.

*   `constructor(name, fn, description)`:
    *   `name` (String): The name of the check displayed during boot.
    *   `fn` (Function): An async function that performs the check. It should return `true` for success and `false` for failure.

### `BootCheckRegistry`

Accessed via `CentralTerminal.bootRegistry`.

*   `add(check)`: Use this method to add a new `BootCheck` instance to the boot sequence.

### Example: Adding a Custom Boot Check

```javascript
import { CentralTerminal, BootCheck } from './src/terminal.js';

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
