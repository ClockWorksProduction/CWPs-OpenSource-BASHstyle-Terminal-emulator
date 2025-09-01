# CWP Open Terminal Emulator

[![GitHub package version](https://img.shields.io/github/package-json/v/ClockWorksProduction/CWPs-OpenSource-BASHstyle-Terminal-emulator?filename=CWP_OpenTerminalEmmulator_CORE/package.json)](https://github.com/ClockWorksProduction/CWPs-OpenSource-BASHstyle-Terminal-emulator/pkgs/npm/cwp-open-terminal-emulator)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPLv3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

- **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
- **Virtual File System:** An in-memory file system to simulate file and directory operations.
- **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
- **Easy Integration:** Import and initialize the terminal with just a few lines of code.
- **Dual Registry Support:** Install from either the public NPM registry or GitHub Packages.

## Installation

You can install the library from either the standard NPM registry or from GitHub Packages.

### Option 1: Install from NPM Registry (Recommended)

This is the easiest and most common way to install the package.

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator
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
    @clockworksproduction-studio:registry=https://npm.pkg.github.com/
    ```

3.  **Install the package.**

    Now you can install the package as usual:

    ```bash
    npm install @clockworksproduction-studio/cwp-open-terminal-emulator
    ```

## Quick Start

Once installed, you can import and use the terminal in your project.

```javascript
import { CentralTerminal, Addon, Command } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

// 1. Initialize the Terminal
const term = new CentralTerminal('#central-terminal-container', {
    prompt: '[user@localhost ~]$ '
});

// 2. (Optional) Create a custom login message
class LoginAddon extends Addon {
    constructor() {
        super('login');
    }

    onStart(term) {
        const lastLogin = new Date(Date.now() - 86400000).toString(); // 24 hours ago
        term.print(`Last login: ${lastLogin} on ttys001`);
        term.print("Welcome to your new terminal!");
        term.print("Type 'help' to get started.");
    }
}

// 3. (Optional) Register and run the login addon
term.registerAddon(new LoginAddon());
term.addonExecutor.startAddon('login', term, term.vOS);

// 4. (Optional) Add a new command
term.addCommand(new Command('whoami', 'Prints the current user', () => {
    term.print('user');
}));

// 5. Boot the terminal
term.boot();
```

## License

This project is licensed under the GNU Lesser General Public License v3.0 or later (LGPLv3+).

✅ You can use this library freely in personal, open-source, or commercial projects.

✅ You may distribute applications that link to this library under any license you choose.

⚠️ If you modify this library itself and distribute your changes, you must publish them under the LGPLv3 as well.

This ensures the core library remains open source, while still allowing broad use and integration in proprietary or open projects.

See the [LICENSE](LICENSE) file for the full license text.