# Getting Started

This guide will walk you through the process of installing the CWP Open Terminal Emulator and getting it running in your web application.

## Installation

You can install the library from either the standard NPM registry or from GitHub Packages.

### Option 1: Install from NPM Registry (Recommended)

This is the easiest and most common way to install the package.

```bash
npm install @clockworksproduction/cwp-open-terminal-emulator
```

### Option 2: Install from GitHub Packages

If you prefer to use GitHub Packages, you will need to authenticate to the GitHub registry.

1.  **Authenticate with GitHub Packages.**

    You need to have a `~/.npmrc` file with an access token. If you don't have one, create it:

    ```bash
    echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" > ~/.npmrc
    ```

    Replace `YOUR_GITHUB_TOKEN` with a [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) that has the `read:packages` permission.

2.  **Add the registry to your project.**

    Create a `.npmrc` file in your project's root directory and add the following line:

    ```
    @clockworksproduction:registry=https://npm.pkg.github.com/
    ```

3.  **Install the package.**

    Now you can install the package as usual:

    ```bash
    npm install @clockworksproduction/cwp-open-terminal-emulator
    ```

## Basic Usage

Once installed, you can import and use the terminal in your project.

1.  **Create a container element** in your HTML file. This is where the terminal will be rendered.

    ```html
    <div id="terminal-container" style="width: 800px; height: 600px;"></div>
    ```

2.  **Import and initialize the terminal** in your JavaScript file.

    ```javascript
    import { CentralTerminal } from '@clockworksproduction/cwp-open-terminal-emulator';

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
