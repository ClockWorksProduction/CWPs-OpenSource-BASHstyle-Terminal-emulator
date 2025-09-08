# CWP Open Terminal Emulator

[![License: LGPL v3](https://img.shields.io/badge/License-LGPLv3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![npm version](https://img.shields.io/npm/v/@clockworksproduction-studio/cwp-open-terminal-emulator.svg)](https://www.npmjs.com/package/@clockworksproduction-studio/cwp-open-terminal-emulator)

A modular, BASH-style terminal emulator library for the web. CWP Open Terminal Emulator is a lightweight, extensible, and easy-to-integrate solution for adding a terminal interface to your web applications.

## Features

*   **BASH-like Environment:** Familiar commands like `ls`, `cd`, `cat`, `mkdir`, `pwd`, `rm`, `echo`, and `history`.
*   **Virtual File System:** An in-memory file system to simulate file and directory operations.
*   **Extensible Addon System:** Create your own commands and applications that run inside the terminal.
*   **Lightweight Core:** The core terminal is minimal, allowing you to add only the features you need.
*   **Official Addons:** A collection of optional, pre-built modules (addons) that add extra features like a package manager, text editor, and system monitoring tools.
*   **Flexible Release System:** A four-tier release system, allowing you to choose the stability level that best suits your needs.

## Installation

This project uses a four-tier release system. Choose the stability level that best suits your needs:

*   **Stable (`@latest`):** Recommended for most users.
    ```bash
    npm install @clockworksproduction-studio/cwp-open-terminal-emulator@latest
    ```
*   **Long-Term Support (`@lts`):** For critical bug fixes on a previous major version.
    ```bash
    npm install @clockworksproduction-studio/cwp-open-terminal-emulator@lts
    ```
*   **Nightly (`@nightly`):** Bi-weekly pre-releases for testing upcoming features.
    ```bash
    npm install @clockworksproduction-studio/cwp-open-terminal-emulator@nightly
    ```
*   **Dev (`@dev`):** Bleeding-edge versions, published with every commit.
    ```bash
    npm install @clockworksproduction-studio/cwp-open-terminal-emulator@dev
    ```

## Usage

Here's a complete example of how to set up and use the terminal:

### 1. HTML (`index.html`)

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
    <div id="bios-screen">
        <div id="bios-output"></div>
        <div id="bios-footer">
            <p>CWP OpenBIOS v1.0</p>
            <p>Initializing...</p>
        </div>
    </div>
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
    <script type="module" src="app.js"></script>
</body>
</html>
```

### 2. JavaScript (`app.js`)

```javascript
import { CentralTerminal, BootCheck } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

const term = new CentralTerminal('#central-terminal-container');

const checkSystemFiles = new BootCheck(
    'Checking system files',
    () => new Promise(resolve => setTimeout(() => resolve(true), 500))
);

const checkHardware = new BootCheck(
    'Verifying hardware compatibility',
    () => new Promise(resolve => setTimeout(() => resolve(true), 500))
);

async function startTerminal() {
    const bootManager = term.bootCheckRegistry;
    bootManager.addCheck(checkSystemFiles);
    bootManager.addCheck(checkHardware);

    await bootManager.runChecks(term);

    document.getElementById('bios-screen').style.display = 'none';
    document.getElementById('central-terminal-container').style.display = 'block';

    term.print('Welcome to the terminal.');
}

startTerminal();
```

### 3. CSS (`style.css`)

```css
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

For more detailed information, please see the [official documentation](docs/index.md).

*   [Getting Started](docs/getting-started.md)
*   [API Reference](docs/api-reference.md)
*   [Default Commands](docs/commands.md)
*   [Addon System](docs/addons.md)
*   [Virtual File System](docs/filesystem.md)
*   [Release System](docs/release-system.md)
*   [Troubleshooting](docs/troubleshooting.md)

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details on the development process and our automated release system.

## License

This project is licensed under the LGPLv3+. See the [LICENSE](LICENSE) file for details.
