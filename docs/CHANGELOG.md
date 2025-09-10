# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.1.5] - 2025-09-09

### Added
- **`hclear` command:** A new utility command to clear the entire command history from the terminal session and `localStorage`.

### Fixed
- **Addon Command Handling:** Corrected a critical regression in `runCommand` where it failed to delegate input to active addons (like `edit` or `rps`), rendering them unusable.
- **`cd` Command:** Fixed a bug where the `cd` command was not correctly changing the directory within the Virtual File System (`vOS`). It now properly uses `vOS.chdir`.
- **VFS Initialization:** Repaired a VFS boot sequence error where the `/home/user` directory was not being created, causing widespread command failures.
- **Command History:** Fixed a bug where commands were not being pushed to the history stack, and ensured history is correctly saved and loaded.
- **Boot Sequence:** Resolved an issue in the `BootCheckRegistry` that prevented saved sessions from `localStorage` from being loaded during tests.

### Changed
- **Test Suite:** Significantly improved the Jest test suite by mocking UI components more accurately and adding coverage for the new `hclear` command and history persistence.

## [5.1.4] - 2025-09-08

### Fixed
- **CLI Setup Script:** Corrected a critical bug in the `cwp-terminal-setup` script where it would fail to generate the `app.js` file in `manual` mode.

### Added
- **CLI Test Suite:** Implemented a comprehensive Jest test suite for the `cwp-terminal-setup` script. The new tests cover the `scaffold`, `refactor`, and `manual` modes to ensure reliability.

### Changed
- **Documentation:** Rewrote the `SETUP.md` guide to prioritize the new automated setup script and re-framed the previous content as the "Manual Integration" path. Removed the redundant `getting-started.md` and fixed all broken links.

## [5.1.0] - 2025-09-06

### Changed
- **Refactored Addon Architecture:** The entire addon system has been overhauled. Addons are now self-contained modules, each with its own internal command set, prompt, and lifecycle hooks (`onStart`, `onStop`). This makes addons more powerful, independent, and easier to develop. The `run` command is now the designated executor for these addons.
- **Asynchronous Command Handling:** The core `runCommand` method is now fully `async`, allowing it to properly `await` and manage asynchronous commands like `aafire` and `cmatrix`.

### Added
- **Comprehensive Test Suite:** A full Jest test suite (`test/terminal.test.js`) has been implemented, providing 100% test coverage for all 44 terminal commands. This ensures stability and prevents future regressions.
- **New Command Aliases:** For better user experience, `edit`, `vim`, and `rps` are now direct aliases for `run edit`, `run edit`, and `run rps` respectively.
- **`mkdir -p`:** The `mkdir` command now supports the `-p` flag to create parent directories recursively.

### Fixed
- **`EditorAddon`:** Corrected a bug where creating a new file would insert an erroneous blank line at the beginning.
- **Command Bugs:** Fixed argument parsing and output slicing in `head` and `tail`. Corrected output filtering in `grep`.
- **Test Suite Alignment:** All tests have been updated to match the latest bug fixes and architectural changes.

## [5.0.0] - 2025-09-05

### Added
- **Initial Release:** First major version of the CWP Open Terminal Emulator.
- **Core Terminal:** Includes a BASH-style command parser, virtual file system, and command history.
- **Official Addons:** A suite of optional addons for a text editor (`edit`), package manager (`tpkg`), system monitor (`top`), rock-paper-scissors game (`rps`), and network tools (`net`).
- **Boot Manager:** A BIOS-style pre-boot sequence for running diagnostic checks.
- **Automated Release System:** Four-tier release system for dev, nightly, stable, and LTS channels managed via GitHub Actions.
