# Getting Started

This guide will walk you through the process of installing the CWP Open Terminal Emulator and getting it running in your web application.

## Installation

You can install the library from the standard NPM registry.

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator
```

## Basic Usage

Once installed, you can import and use the terminal in your project.

1.  **Create a container element** in your HTML file. This is where the terminal will be rendered.

    ```html
    <div id="terminal-container" style="width: 800px; height: 600px;"></div>
    ```

2.  **Import and initialize the terminal** in your JavaScript file.

    ```javascript
    import { CentralTerminal } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

    // Initialize the Terminal, passing in the ID of the container element
    const term = new CentralTerminal('#terminal-container');

    // Boot the terminal to start the session
    term.boot();
    ```

This will create a new terminal instance with all the default commands and features ready to use.

## Next Steps

Now that you have the terminal running, you can explore its features:

*   [Learn about the core API](./api-reference.md)
*   [See the list of default commands](./commands.md)
*   [Create your own custom addons](./addons.md)
