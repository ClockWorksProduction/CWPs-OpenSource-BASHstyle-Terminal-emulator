# CWP Open Terminal Emulator

[![NPM version](https://img.shields.io/npm/v/cwp-open-terminal-emulator.svg)](https://www.npmjs.com/package/cwp-open-terminal-emulator)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

-   **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
-   **Virtual File System:** An in-memory file system to simulate file and directory operations.
-   **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
-   **Easy Integration:** Import and initialize the terminal with just a few lines of code.
-   **NPM Package:** Easily add the terminal to your project using NPM.

## Installation

You can install the library using NPM:

```bash
npm install cwp-open-terminal-emulator
```

## Quick Start

1.  **Create an HTML file** with a container for the terminal and the necessary input/output elements.

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Central Terminal</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <div id="central-terminal-container">
            <div id="bios-screen" style="display: block;">
                <div id="bios-output"></div>
            </div>
            <div id="pseudo-terminal" style="display: none;">
                <div id="terminalOutput"></div>
                <div class="terminal-input-line">
                    <span class="prompt">></span>
                    <input type="text" id="terminal-command-input" autofocus />
                </div>
            </div>
        </div>
        <script type="module" src="main.js"></script>
    </body>
    </html>
    ```

2.  **Create a `main.js` file** to import and initialize the terminal.

    ```javascript
    import { CentralTerminal, Addon, Command } from './node_modules/cwp-open-terminal-emulator/dist/terminal.js';

    // 1. Initialize the Terminal
    const term = new CentralTerminal('#central-terminal-container');

    // 2. (Optional) Create a custom addon
    class GreeterAddon extends Addon {
        constructor() {
            super('greet');
        }

        onStart(term, vOS, name) {
            this.term.print(`Hello, ${name || 'World'}!`);
            this.term.print("This is a custom addon. Type 'exit' to return to the main terminal.");
        }
    }

    // 3. (Optional) Register the addon
    term.registerAddon(new GreeterAddon());
    
    // 4. (Optional) Add a new command to the main terminal
    term.addCommand(new Command('hello', 'Says hello.', (args) => {
        term.print(`Hello, ${args[0] || 'stranger'}!`);
    }));

    // 5. Boot the terminal
    term.boot();
    ```

## Documentation

### `CentralTerminal`

The main class for the terminal emulator.

-   `new CentralTerminal(containerId)`: Creates a new terminal instance.
    -   `containerId` (string): The CSS selector for the terminal's main container element.

-   `boot()`: Starts the BIOS boot sequence and initializes the terminal.

-   `registerAddon(addon)`: Registers a custom addon.
    -   `addon` (Addon): An instance of a class that extends `Addon`.

-   `addCommand(command)`: Adds a new command to the main terminal.
    -   `command` (Command): An instance of the `Command` class.

### `Addon`

The base class for creating custom addons.

-   `constructor(name)`: Creates a new addon.
    -   `name` (string): The name used to run the addon (e.g., `run <name>`).

-   `onStart(term, vOS, ...args)`: Called when the addon is started.

-   `onCommand(input)`: Called when a command is entered while the addon is active.

-   `onStop()`: Called when the addon is stopped (e.g., with the `exit` command).

### `Command`

The class for creating new commands.

-   `constructor(name, description, execute, aliases)`
    -   `name` (string): The name of the command.
    -   `description` (string): A brief description shown in the `help` command.
    -   `execute` (function): The function to execute when the command is run. It receives an array of arguments.
    -   `aliases` (array): An optional array of alternative names for the command.

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
