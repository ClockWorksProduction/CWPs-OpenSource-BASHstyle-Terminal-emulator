# CWP Open Terminal Emulator

[![License: LGPL v3](https://img.shields.io/badge/License-LGPLv3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator.svg)](https://www.npmjs.com/package/@clockworksproduction-studio/cwp-open-terminal-emulator)

A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

- **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
- **Virtual File System:** An in-memory file system to simulate file and directory operations.
- **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
- **Lightweight Core:** The core terminal is minimal, allowing you to add only the features you need.
- **Official Addons:** A collection of optional, pre-built modules (addons) that add extra features like a package manager, text editor, and system monitoring tools.

## Installation

This project uses a four-tier release system, allowing you to choose the stability level that best suits your needs.

### Stable Version (`@latest`)
This is the recommended version for most users. It is the official, production-ready release.
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@latest
```

### Long-Term Support (`@lts`)
This channel provides critical bug fixes for a previous major version, offering maximum stability for large or legacy projects.
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@lts
```

### Nightly Version (`@nightly`)
A bi-weekly pre-release for developers who want to test upcoming features.
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@nightly
```

### Dev Version (`@dev`)
The bleeding-edge version, published with every single commit to the `main` branch. Not recommended for production.
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator@dev
```

## Live Demo & Example

Below is a complete, runnable example of how to set up and use the terminal.

### 1. The HTML

First, create an `index.html` file. This will serve as the entry point for your application. It contains a "BIOS" screen that shows boot checks and the main terminal container, which is initially hidden.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CWP Open Terminal Emulator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- BIOS Boot Screen (visible on start) -->
    <div id="bios-screen">
        <div id="bios-output"></div>
        <div id="bios-footer">
            <p>CWP OpenBIOS v1.0</p>
            <p>Initializing...</p>
        </div>
    </div>

    <!-- Main Terminal (initially hidden) -->
    <div id="central-terminal-container" style="display: none;">
        <div id="terminal-ui">
            <div id="terminal-output-panel">
                <div id="terminalOutput"></div>
            </div>
            <div id="terminal-input-panel">
                <span id="terminal-prompt">></span>
                <input type="text" id="terminal-command-input" autofocus />
            </div>
        </div>
    </div>

    <!-- Load the application script as a module -->
    <script type="module" src="app.js"></script>
</body>
</html>
```

### 2. The JavaScript

Next, create an `app.js` file. This is where you will import the terminal, register addons, and boot the system.

```javascript
import { CentralTerminal, BootCheck } from '@clockworksproduction-studio/cwp-open-terminal-emulator';
// Note: When using addons, adjust the import path based on your project structure.
// For example: import { register as registerRPS } from './node_modules/@clockworksproduction-studio/cwp-open-terminal-emulator/addons/rps_addon.js';

// --- 1. Initialize the Terminal ---
const term = new CentralTerminal('#central-terminal-container');

// --- 2. Register Official Addons (Optional) ---
// Addons are optional modules that add extra features.
// To use them, you would first need to import them, e.g.:
// import { register as registerRPS } from './addons/rps_addon.js';
// registerRPS(term.addonExecutor);


// --- 3. Define Boot Checks ---
// These checks run before the terminal is ready.
const checkSystemFiles = new BootCheck(
    'Checking system files',
    () => new Promise(resolve => setTimeout(() => resolve(true), 500))
);

const checkHardware = new BootCheck(
    'Verifying hardware compatibility',
    () => new Promise(resolve => setTimeout(() => resolve(true), 500))
);

const checkNetwork = new BootCheck(
    'Establishing network connection',
    () => new Promise(resolve => setTimeout(() => resolve(false), 500)), // This one will fail for demo purposes
    'Network connection failed, continuing in offline mode.'
);

// --- 4. Boot the Terminal ---
async function startTerminal() {
    const bootManager = term.bootCheckRegistry;
    bootManager.addCheck(checkSystemFiles);
    bootManager.addCheck(checkHardware);
    bootManager.addCheck(checkNetwork);

    const allSystemsGo = await bootManager.runChecks(term);

    // Hide BIOS, show terminal
    document.getElementById('bios-screen').style.display = 'none';
    document.getElementById('central-terminal-container').style.display = 'block';

    if (allSystemsGo) {
        term.print('All systems go! Welcome to the terminal.');
    } else {
        term.print('Boot process encountered non-critical errors. System is online.');
    }
}

startTerminal();
```

### 3. (Optional) The CSS

For styling, you can create a `style.css` file:

```css
/* Add your own styles here */
body {
    background-color: #000;
    color: #0f0;
    font-family: 'monospace', monospace;
}
#central-terminal-container, #bios-screen {
    width: 100%;
    height: 100vh;
}
#terminal-output-panel, #bios-output {
    height: 90vh;
    overflow-y: scroll;
    padding: 10px;
}
#terminal-input-panel {
    display: flex;
}
#terminal-command-input {
    background: transparent;
    border: none;
    color: #0f0;
    width: 100%;
}
```

## Documentation

- [Addon System](docs/addons.md)
- [Troubleshooting and FAQ](docs/troubleshooting.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Contributing

We welcome contributions from the community! This project follows an automated release system managed by GitHub Actions. Please read our **[Contributing Guidelines](CONTRIBUTING.md)** for more details on the development process.

## License

This project is licensed under the LGPLv3+. See the [LICENSE](LICENSE) file for details.
