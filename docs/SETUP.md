# Setup Guide: CWP Open Terminal Emulator

This guide will walk you through installing and connecting the CWP Open Terminal Emulator in your web project.

## Step 1: Install the Library

First, you need to add the library to your project using npm. Open your terminal and run one of the following commands:

```bash
npm install @clockworksproduction-studio/cwp-open-terminal-emulator
```
or for short:
```bash
npm i @clockworksproduction-studio/cwp-open-terminal-emulator
```

## Step 2: Add the Terminal Container to your HTML

Next, you need to specify where the terminal will appear on your webpage. Add an empty `div` element with a unique ID to your `index.html` file (or whichever HTML file you are using).

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App with a Terminal</title>
</head>
<body>
  <!-- ... other content ... -->

  <div id="central-terminal-container"></div>

  <!-- ... other content ... -->

  <script src="my-app.js" type="module"></script>
</body>
</html>
```

**Note:** The ID `#central-terminal-container` is used in the example below. You can choose any ID you like, but make sure it matches the one you use in your JavaScript configuration.

## Step 3: Connect the Terminal in JavaScript

Now, let's bring the terminal to life. In your main JavaScript file (e.g., `my-app.js`), you'll import the library, create a new terminal instance, and boot it up.

Here is a basic setup to get you started:

```javascript
// Import the main Terminal class from the library
import { CentralTerminal } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

// 1. Find the container element you created in your HTML
const terminalContainer = '#central-terminal-container';

// 2. Define any custom options (the prompt is a great one to customize!)
const terminalOptions = {
    prompt: '[user@localhost ~]$ '
};

// 3. Initialize the Terminal by passing the container and options
const term = new CentralTerminal(terminalContainer, terminalOptions);

// 4. Boot the terminal to start it
// This makes it visible and ready for commands.
term.boot();

console.log('Terminal has been successfully booted!');
```

And that's it! When you open your HTML file in a browser, you should now see a fully functional terminal.

## Step 4: Next Steps & Customization

Your terminal is running, what's next?

*   Type `help` in the terminal to see a list of default commands.
*   Explore how to create your own [custom addons](./docs/addons.md).
*   Learn how to add your own [unique commands](./docs/commands.md).
*   Dive into the [full API reference](./docs/api-reference.md) for advanced usage.

Happy coding!
