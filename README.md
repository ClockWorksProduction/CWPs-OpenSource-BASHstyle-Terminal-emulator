# CWP Open Terminal Emulator v5.1.0

CWP Open Terminal Emulator is a versatile, embeddable, and highly extensible terminal emulator for web applications. It provides a realistic BASH-like experience, complete with a virtual file system, command history, and a powerful, modern addon architecture.

## Release Channels

This project uses a four-tier release system to provide versions for every need, from bleeding-edge development builds to stable long-term support. You can install any channel via npm.

| Channel | npm Tag | Source Branch | Trigger | Current Version |
|---|---|---|---|---|
| **Dev** | `@dev` | `main` | Every push | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/dev.svg) |
| **Nightly** | `@nightly`| `main` | Bi-weekly schedule | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/nightly.svg) |
| **Stable** | `@latest` | `main` | Manual dispatch | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/latest.svg) |
| **LTS** | `@lts` | `main` | Manual dispatch | ![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator/lts.svg) |

For more detailed information, see the **[Release & Publishing Guide](docs/release-system.md)**.

## Features

- **Extensive Command Library:** Over 40 familiar commands, including `ls`, `cd`, `cat`, `mkdir`, `grep`, `tree`, and more.
- **Virtual File System (VOS):** A complete in-memory file system with support for files, directories, and path manipulation.
- **State Persistence:** Automatically saves and reloads the file system and command history to `localStorage`.
- **Robust Addon Architecture:** Create self-contained sub-applications that run within the terminal. See [docs/addons.md](docs/addons.md) for a full guide.
- **Asynchronous Commands:** Supports long-running and animated commands like `aafire` and `cmatrix` without blocking the UI.
- **Comprehensive Test Suite:** 100% test coverage for all 44 commands, ensuring stability and reliability.

## Quick Start

To embed the terminal in your project:

1.  **Include the Source:** Add `terminal.js` to your project.
2.  **Create a Container:** Add a `div` element to your HTML where you want the terminal to appear.
3.  **Initialize:** Instantiate the `CentralTerminal` class with the selector for your container.

```html
<div id="my-terminal"></div>
```

```javascript
import { CentralTerminal, EditorAddon, RpsAddon } from './path/to/terminal.js';

// Create the terminal instance
const term = new CentralTerminal('#my-terminal');

// --- Register Addons ---
// Addons provide sub-applications like text editors or games.
// See docs/addons.md for more info.
term.registerAddon(new EditorAddon());
term.registerAddon(new RpsAddon());

// Boot the terminal to run pre-boot checks and display the prompt.
term.boot();
```

## Documentation

- **[Changelog](docs/CHANGELOG.md):** See the full history of changes.
- **[Addon Architecture](docs/addons.md):** A detailed guide on creating and registering your own addons.
- **[Release System](docs/release-system.md):** A guide to the different release channels.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.
