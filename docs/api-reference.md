# API Reference

This document provides a detailed reference for the core API of the CWP Open Terminal Emulator library.

## `CentralTerminal`

The `CentralTerminal` class is the main entry point for creating and managing the terminal.

### `constructor(containerId)`

*   `containerId` (String): The ID of the HTML element that will contain the terminal.

Creates a new terminal instance. The container element must exist in the DOM before the terminal is initialized.

### `boot()`

Starts the terminal boot sequence. This will run any registered boot checks and, if successful, display the terminal interface.

### `addCommand(command)`

*   `command` (Command): An instance of the `Command` class.

Registers a new command with the terminal. The command will be available to the user in the terminal interface.

### `registerAddon(addon)`

*   `addon` (Addon): An instance of an `Addon` class.

Registers a new addon with the terminal. Addons can be started using the `run` command.

### `print(text)`

*   `text` (String): The text to print to the terminal.

Prints a line of text to the terminal output.

### `printHtml(html)`

*   `html` (String): The HTML to render in the terminal.

Prints a raw HTML string to the terminal output. This can be used for rendering images, links, and other rich content.

### `clear()`

Clears the terminal output.

## `Command`

The `Command` class is used to create new commands for the terminal.

### `constructor(name, description, execute, aliases)`

*   `name` (String): The name of the command.
*   `description` (String): A brief description of the command.
*   `execute` (Function): The function to execute when the command is run. The function will receive an array of arguments as its only parameter.
*   `aliases` (Array): An optional array of alternative names for the command.

## `Addon`

The `Addon` class is the base class for creating new addons.

### `constructor(name)`

*   `name` (String): The name of the addon. This is the name that will be used to start the addon with the `run` command.

### `onStart(term, vOS, ...args)`

*   `term` (CentralTerminal): The `CentralTerminal` instance.
*   `vOS` (VOS): The virtual operating system instance.
*   `...args` (Array): Any additional arguments passed to the `run` command.

This method is called when the addon is started. It can be used to initialize the addon and perform any setup tasks.

### `onCommand(input)`

*   `input` (String): The command entered by the user.

This method is called for every command the user enters while the addon is active. The addon is responsible for parsing and handling the command.

### `onStop()`

This method is called when the addon is stopped (e.g., when the user runs the `exit` command).
