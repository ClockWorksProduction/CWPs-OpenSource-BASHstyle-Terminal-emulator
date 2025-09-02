# CWP Open Terminal Emulator

[![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator.svg)](https://www.npmjs.com/package/@clockworksproduction-studio/cwp-open-terminal-emulator)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPLv3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

- **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
- **Virtual File System:** An in-memory file system to simulate file and directory operations.
- **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
- **Easy Integration:** Import and initialize the terminal with just a few lines of code.

## Installation

This is the easiest and most common way to install the package.

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator
```

or 

```bash
npm i @clockworksproduction-studio/cwp-open-terminal-emulator
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

## Documentation

- [Addon System](docs/addons.md)
- [Troubleshooting and FAQ](docs/troubleshooting.md)

## License

This project is licensed under the GNU Lesser General Public License v3.0 or later (LGPLv3+).

✅ You can use this library freely in personal, open-source, or commercial projects.

✅ You may distribute applications that link to this library under any license you choose.

⚠️ If you modify this library itself and distribute your changes, you must publish them under the LGPLv3 as well.

This ensures the core library remains open source, while still allowing broad use and integration in proprietary or open projects.

See the [LICENSE](LICENSE) file for the full license text.
