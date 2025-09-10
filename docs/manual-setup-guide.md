# Detailed Manual Setup Guide

This guide provides a complete, step-by-step walkthrough for manually integrating the CWP Open Terminal Emulator into your web project. It covers the required HTML, CSS, and JavaScript, and explains how to connect them.

## Overview

The manual setup involves three main files:

1.  **`index.html`**: The main web page that will contain the terminal.
2.  **`style.css`**: The stylesheet to provide basic styling for the terminal container.
3.  **`app.js`**: The JavaScript file to import, configure, and boot the terminal.

---

## Step 1: The HTML File (`index.html`)

First, create your main HTML file. The key element is a `<div>` with a unique ID (e.g., `id="terminal"`). This `div` is the container where the terminal will be rendered. You also need to link your CSS and JavaScript files.

**Template: `index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CWP Terminal - Manual Setup</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>CWP Open Terminal Emulator</h1>
    <p>This is a demonstration of a manual terminal setup.</p>

    <!-- This is the container where the terminal will be rendered. -->
    <div id="terminal"></div>

    <!-- The 'type="module"' is required for using ES6 imports. -->
    <script src="app.js" type="module"></script>
</body>
</html>
```

---

## Step 2: The CSS File (`style.css`)

Next, create a basic stylesheet. For the terminal to display correctly, its container needs to have a defined size. You can also add styling to match your site's design.

**Template: `style.css`**
```css
/*
 * Basic styling for the body and the terminal container.
 */

body {
    background-color: #1a1a1a;
    color: #f0f0f0;
    font-family: Arial, sans-serif;
    padding: 20px;
}

h1 {
    color: #00aaff;
}

/*
 * This is the essential styling for the terminal container.
 * The terminal library is 'headless' and will fill the container you provide.
 * You MUST give the container a height for it to be visible.
 */
#terminal {
    width: 100%;
    height: 500px; /* You must define a height */
    border: 1px solid #555;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
```
---

## Step 3: The JavaScript File (`app.js`)

This is where the terminal is initialized. You need to import the necessary classes from the npm package and any addons you wish to use. The code should run after the HTML document is fully loaded, which is why we use the `DOMContentLoaded` event listener.

**Prerequisite:** Make sure you have installed the package in your project:
```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator
```

**Template: `app.js`**
```javascript
// Import the main Terminal class and any addons you want to use
import { CentralTerminal } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/core/central-terminal.js''';
import { EditorAddon } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/addons/editor-addon.js''';
import { RpsAddon } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/addons/rps-addon.js''';

/**
 * The main entry point for the application.
 * This script waits for the DOM to be fully loaded before initializing the terminal
 * to prevent race conditions where the script runs before the '#terminal' element exists.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize the Terminal by passing in the query selector of the container element.
    const term = new CentralTerminal('#terminal');

    // 2. (Optional) Register any addons.
    // Addons provide sub-applications like a text editor or a game.
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon()); // Rock-Paper-Scissors game

    // 3. Boot the terminal.
    // This runs pre-boot checks (like loading history from localStorage) and displays the prompt.
    await term.boot();

    console.log('Terminal has been successfully booted!');

  } catch (error) {
    // If the terminal fails to boot, log the error to the console.
    console.error("Failed to initialize terminal:", error);
    // You could also display a user-friendly error message on the page.
    const termContainer = document.querySelector('#terminal');
    if (termContainer) {
        termContainer.innerHTML = '<div style="color: red; padding: 15px;"><strong>Error:</strong> Failed to load terminal. See console for details.</div>';
    }
  }
});
```
---

## Final Steps

1.  Place `index.html`, `style.css`, and `app.js` in the same directory.
2.  Make sure you have run `npm install` for the terminal emulator package.
3.  Serve the `index.html` file using a local web server. You cannot open the file directly in the browser using `file://` because of security restrictions related to ES6 modules. A simple way to do this is to use `npx serve`.

```bash
# Navigate to the directory containing your files
cd /path/to/your/project

# If you don't have a package.json, create one
npm init -y

# Install the terminal
npm install @clockworksproduction-studio/cwp-open-terminal-emulator

# Install and run a local server
npx serve
```

Now, when you open the provided URL (e.g., `http://localhost:3000`), you will see your fully functional terminal.
