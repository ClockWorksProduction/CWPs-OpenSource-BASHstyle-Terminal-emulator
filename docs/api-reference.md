# API Reference

This document provides a detailed reference for the core API of the CWP Open Terminal Emulator library.

---

## `CentralTerminal`

The `CentralTerminal` class is the main entry point for creating and managing the terminal.

### `constructor(containerId)`

*   `containerId` (String): The ID of the HTML element that will contain the terminal.

Creates a new terminal instance. The container element must exist in the DOM before the terminal is initialized.

### `bootCheckRegistry`

A `BootCheckRegistry` instance that manages the boot checks.

### `commandRegistry`

A `CommandRegistry` instance that manages the terminal commands.

### `addonExecutor`

An `AddonExecutor` instance that manages the addons.

### `print(text)`

*   `text` (String): The text to print to the terminal.

Prints a line of text to the terminal output.

### `printHtml(html)`

*   `html` (String): The HTML to render in the terminal.

Prints a raw HTML string to the terminal output. This can be used for rendering images, links, and other rich content.

### `clear()`

Clears the terminal output.

---

## `Addon`

The `Addon` class is the base class for creating new addons.

### `constructor(name)`

*   `name` (String): The name of the addon. This is the name that will be used to start the addon with the `run` command.

### `onStart(term, vOS, ...args)`

*   `term` (CentralTerminal): The `CentralTerminal` instance.
*   `vOS` (VOS): The virtual operating system instance. See the `VOS` API reference below.
*   `...args` (Array): Any additional arguments passed to the `run` command.

This method is called when the addon is started. It can be used to initialize the addon and perform any setup tasks.

### `onCommand(input)`

*   `input` (String): The command entered by the user.

This method is called for every command the user enters while the addon is active. The addon is responsible for parsing and handling the command.

### `onStop()`

This method is called when the addon is stopped (e.g., when the user runs the `exit` command).

---

## `VOS` (Virtual Operating System)

The `VOS` class provides the API for interacting with the virtual file system. An instance is passed to every addon's `onStart` method.

### `createFile(path, content)`
*   `path` (String): The full path of the file to create.
*   `content` (String): Optional initial content for the file.
*   **Returns**: `true` on success, `false` if the file already exists or the path is invalid.

### `readFile(path)`
*   `path` (String): The full path of the file to read.
*   **Returns**: The file content as a string, or `null` if the file does not exist.

### `updateFile(path, content)`
*   `path` (String): The full path of the file to update.
*   `content` (String): The new content to write to the file.
*   **Returns**: `true` on success, `false` if the file does not exist.

### `deleteFile(path)`
*   `path` (String): The full path of the file to delete.
*   **Returns**: `true` on success, `false` if the file does not exist.

### `createDirectory(path)`
*   `path` (String): The full path of the directory to create.
*   **Returns**: `true` on success, `false` if the directory already exists or the path is invalid.

### `listDirectory(path)`
*   `path` (String): The path of the directory to list.
*   **Returns**: An array of strings containing the names of files and directories, or `null` if the path is not a valid directory.

### `getFullPath(path)`
*   `path` (String): The relative or absolute path to resolve. Supports `.`, `..`, and `~` for the user's home directory.
*   **Returns**: The fully resolved absolute path as a string.

### `pathExists(path)`
*   `path` (String): The path to check.
*   **Returns**: `true` if a file or directory exists at the given path, `false` otherwise.

---

## Other Classes

For information on the `BootCheck`, `BootCheckRegistry`, `Command`, `CommandRegistry`, and `AddonExecutor` classes, please refer to the source code.
