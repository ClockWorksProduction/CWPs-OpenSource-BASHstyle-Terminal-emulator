# CWP Open Terminal Emulator v5.1.5

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

- **Extensive Command Library:** Over 40 familiar commands, including `ls`, `cd`, `grep`, `hclear`, and more.
- **Virtual File System (VOS):** A complete in-memory file system with support for files, directories, and path manipulation.
- **State Persistence:** Automatically saves and reloads the file system and command history to `localStorage`.
- **Robust Addon Architecture:** Create self-contained sub-applications that run within the terminal. See [docs/addons.md](docs/addons.md) for a full guide.
- **Asynchronous Commands:** Supports long-running and animated commands like `aafire` and `cmatrix` without blocking the UI.
- **Comprehensive Test Suite:** High test coverage for all 45 commands, ensuring stability and reliability.

## Quick Setup (Automated)

For the fastest setup, use the automated CLI tool. This will create a new directory with a sample project, including all the necessary HTML, CSS, and JS files.

```bash
npx @clockworksproduction-studio/cwp-terminal-setup
```

The script will guide you through the process. For more details, see the **[Setup Guide](docs/SETUP.md)**.

## Manual Setup

For users who prefer a hands-on approach or need a more customized integration, we provide a complete, step-by-step guide with ready-to-use code templates.

- **[Detailed Manual Setup Guide](docs/manual-setup-guide.md)**

## Documentation

- **[Setup Guide](docs/SETUP.md):** Instructions for automated and manual setup.
- **[Manual Setup Guide](docs/manual-setup-guide.md):** A detailed walkthrough with code templates for custom integrations.
- **[Command Reference](docs/commands.md):** A complete list of all available commands.
- **[Changelog](docs/CHANGELOG.md):** See the full history of changes.
- **[Addon Architecture](docs/addons.md):** A detailed guide on creating and registering your own addons.
- **[Release System](docs/release-system.md):** A guide to the different release channels.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.
