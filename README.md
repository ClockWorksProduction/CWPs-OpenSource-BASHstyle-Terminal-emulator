# CWP Open Terminal Emulator

[![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator.svg)](https://www.npmjs.com/package/@clockworksproduction-studio/cwp-open-terminal-emulator)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPLv3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

- **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
- **Virtual File System:** An in-memory file system to simulate file and directory operations.
- **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
- **Easy Integration:** Import and initialize the terminal with just a few lines of code.

## Getting Started

We offer two convenient ways to get your terminal up and running:

### 1. Automated Setup (Recommended)

For the fastest setup, run our interactive tool. It will ask you a few questions and automatically generate the necessary files for you.

After installing the package, run the following command in your project's root directory:

```bash
npx cwp-terminal-setup
```

### 2. Manual Setup

If you prefer to set things up yourself, our **[Manual Setup Guide (SETUP.md)](SETUP.md)** provides a complete walkthrough from installation to a fully functional terminal.

## Installation

If you use the manual setup, you'll need to install the package first.

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator
```

or 

```bash
npm i @clockworksproduction-studio/cwp-open-terminal-emulator
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
