# CWP Open Terminal Emulator

[![License: LGPL v3](https://img.shields.io/badge/License-LGPLv3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

- **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
- **Virtual File System:** An in-memory file system to simulate file and directory operations.
- **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
- **Lightweight Core:** The core terminal is minimal, allowing you to add only the features you need.

## Releases

This project provides four distinct release channels on npm to suit your needs.

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

### Nightly Release (`@nightly`)

A more stable pre-release version, published bi-weekly. Ideal for developers who want to test upcoming features without being on the commit-by-commit bleeding edge.

[![npm version (nightly)](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/nightly.svg)](https://www.npmjs.com/package/@clockworksproduction-studio/cwp-open-terminal-emulator)

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@nightly
```

### Dev Release (`@dev`)

The most unstable, bleeding-edge version, published with every single commit to the `main` branch.

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

If you prefer to set things up yourself, you can easily import the core terminal and add official addons.

1.  **Import the Core Terminal:**

    ```javascript
    import { CentralTerminal } from '@clockworksproduction-studio/cwp-open-terminal-emulator';
    ```

2.  **Initialize the Terminal:**

    ```javascript
    const terminal = new CentralTerminal('#your-terminal-element-id');
    ```

3.  **(Optional) Add Official Addons:**
    The core terminal is lightweight. You can add official addons for more functionality. Each addon is imported separately from the `addons` directory.

    ```javascript
    // Import the register function from an addon
    import { register as registerEditor } from '@clockworksproduction-studio/cwp-open-terminal-emulator/addons/editor.js';

    // Register the addon with the terminal's addon executor
    registerEditor(terminal.addonExecutor);
    ```

4.  **Boot the Terminal:**

    ```javascript
    terminal.boot();
    ```

For a complete walkthrough, see our **[Manual Setup Guide (docs/SETUP.md)](docs/SETUP.md)**.


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
