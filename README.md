# CWP Open Terminal Emulator

[![GitHub package version](https://img.shields.io/github/package-json/v/ClockWorksProduction/CWPs-OpenSource-BASHstyle-Terminal-emulator?filename=CWP_OpenTerminalEmmulator_CORE/package.json)](https://github.com/ClockWorksProduction/CWPs-OpenSource-BASHstyle-Terminal-emulator/pkgs/npm/cwp-open-terminal-emulator)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)


A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

-   **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
-   **Virtual File System:** An in-memory file system to simulate file and directory operations.
-   **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
-   **Easy Integration:** Import and initialize the terminal with just a few lines of code.
-   **Dual Registry Support:** Install from either the public NPM registry or GitHub Packages.

## Installation

You can install the library from either the standard NPM registry or from GitHub Packages.

### Option 1: Install from NPM Registry (Recommended)

This is the easiest and most common way to install the package.

```bash
npm install @clockworksproduction/cwp-open-terminal-emulator
```

### Option 2: Install from GitHub Packages

If you prefer to use GitHub Packages, you will need to authenticate to the GitHub registry.

1.  **Authenticate with GitHub Packages.**

    You need to have a `~/.npmrc` file with an access token. If you don't have one, create it:

    ```bash
    echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" > ~/.npmrc
    ```

    Replace `YOUR_GITHUB_TOKEN` with a [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) that has the `read:packages` permission.

2.  **Add the registry to your project.**

    Create a `.npmrc` file in your project's root directory and add the following line:

    ```
    @clockworksproduction:registry=https://npm.pkg.github.com/
    ```

3.  **Install the package.**

    Now you can install the package as usual:

    ```bash
    npm install @clockworksproduction/cwp-open-terminal-emulator
    ```

## Quick Start

Once installed, you can import and use the terminal in your project.

```javascript
import { CentralTerminal, Addon, Command } from '@clockworksproduction/cwp-open-terminal-emulator';

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

## License

This project is licensed under the GNU General Public License v3.0 or later. See the [LICENSE](LICENSE) file for details.
