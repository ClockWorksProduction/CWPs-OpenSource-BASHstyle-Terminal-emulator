# CWP Open Terminal Emulator

[![License: LGPL v3](https://img.shields.io/badge/License-LGPLv3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

- **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
- **Virtual File System:** An in-memory file system to simulate file and directory operations.
- **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
- **Easy Integration:** Import and initialize the terminal with just a few lines of code.

## Releases

This project provides three distinct release channels on npm to suit your needs.

### Stable Release (`@latest`)

The official, production-ready version recommended for most users.

[![npm version (stable)](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/latest.svg)](https://www.npmjs.com/package/@clockworksproduction-studio/cwp-open-terminal-emulator)

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@latest
```

### Long-Term Support Release (`@lts`)

Receives critical bug fixes for a specific major version, providing maximum stability for large or legacy projects.

[![npm version (lts)](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/lts.svg)](https://www.npmjs.com/package/@clockworksproduction-studio/cwp-open-terminal-emulator)

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@lts
```

### Nightly Development Release (`@dev`)

Published automatically from the `main` branch. It's great for testing new features but may be unstable.

[![npm version (dev)](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/dev.svg)](https://www.npmjs.com/package/@clockworksproduction-studio/cwp-open-terminal-emulator)

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@dev
```

## Getting Started

We offer two convenient ways to get your terminal up and running:

### 1. Automated Setup (Recommended)

For the fastest setup, run our interactive tool. It will ask you a few questions and automatically generate the necessary files for you.

After installing the package, run the following command in your project's root directory:

```bash
npx cwp-terminal-setup
```

### 2. Manual Setup

If you prefer to set things up yourself, our **[Manual Setup Guide (docs/SETUP.md)](docs/SETUP.md)** provides a complete walkthrough.

## Documentation

- [Addon System](docs/addons.md)
- [Release & Publishing Guide](docs/release-system.md)
- [Troubleshooting and FAQ](docs/troubleshooting.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## Contributing

We welcome contributions from the community! Whether it's reporting a bug, suggesting a feature, or submitting code, your help is appreciated. Please read our **[Contributing Guidelines](CONTRIBUTING.md)** to get started.

## License

This project is licensed under the GNU Lesser General Public License v3.0 or later (LGPLv3+).

✅ You can use this library freely in personal, open-source, or commercial projects.

✅ You may distribute applications that link to this library under any license you choose.

⚠️ If you modify this library itself and distribute your changes, you must publish them under the LGPLv3 as well.

See the [LICENSE](LICENSE) file for the full license text.
