# Setup Guide: CWP Open Terminal Emulator

This guide covers the different ways to install and configure the CWP Open Terminal Emulator in your web project.

## Automated Setup (Recommended)

For the fastest and easiest setup, use the automated CLI tool. This interactive script can generate a complete, ready-to-run project or integrate the terminal into your existing files.

Simply run the following command in your terminal and follow the prompts:

```bash
npx @clockworksproduction-studio/cwp-terminal-setup
```

The script offers three modes:

1.  **`scaffold`**: Creates a new `terminal-demo` directory with all the necessary HTML, CSS, and JavaScript files. This is the best option for new users or for creating a clean test environment.
2.  **`refactor`**: Injects the terminal into your existing project by asking for the paths to your HTML, CSS, and JS files.
3.  **`manual`**: Generates a JavaScript snippet with custom DOM selectors, giving you full control over where the terminal components are rendered.

After the script finishes, your terminal will be ready to go.

---

## Manual Integration Guide

If you prefer to integrate the terminal by hand or need a more customized setup, follow the steps below.

### Step 1: Install the Library

First, add the library to your project using npm:

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator
```

### Step 2: Add the Terminal Container to your HTML

Next, specify where the terminal will appear on your webpage. Add an empty `div` element with a unique ID to your HTML file.

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App with a Terminal</title>
</head>
<body>
  <!-- ... other content ... -->

  <div id="terminal"></div>

  <!-- ... other content ... -->

  <script src="app.js" type="module"></script>
</body>
</html>
```

**Note:** Make sure the ID you choose matches the one you use in your JavaScript configuration.

### Step 3: Connect the Terminal in JavaScript

Now, let's bring the terminal to life. In your main JavaScript file (e.g., `app.js`), you'll import the library, create a new terminal instance, and boot it up.

Here is a basic setup to get you started:

```javascript
// Import the main Terminal class and any addons you want to use
import { CentralTerminal, EditorAddon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize the Terminal by passing in the ID of the container element
    const term = new CentralTerminal('#terminal');

    // 2. (Optional) Register any addons
    term.registerAddon(new EditorAddon());

    // 3. Boot the terminal to run pre-boot checks and display the prompt
    await term.boot();

    console.log('Terminal has been successfully booted!');

  } catch (error) {
    console.error("Failed to initialize terminal:", error);
  }
});
```

And that's it! When you open your HTML file in a browser, you should now see a fully functional terminal.

## Next Steps

Your terminal is running. What's next?

*   Type `help` in the terminal to see a list of default commands.
*   Explore how to create your own [custom addons](./addons.md).
*   Learn how to add your own [unique commands](./commands.md).
*   Dive into the [full API reference](./api-reference.md) for advanced usage.

Happy coding!
