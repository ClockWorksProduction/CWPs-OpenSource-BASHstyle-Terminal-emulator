# Troubleshooting and FAQ

This document provides solutions to common issues and answers frequently asked questions.

## Common Issues

### 1. The Terminal Does Not Appear or Shows an Error on Load

This is the most common issue and is usually caused by one of the following:

*   **JavaScript is running too early:** Your script might be trying to find the terminal's `div` container before the HTML page has fully loaded. **Solution:** Wrap your terminal initialization code in a `DOMContentLoaded` event listener to ensure it runs only after the page is ready.

    ```javascript
    document.addEventListener('DOMContentLoaded', async () => {
      // Your terminal setup code here
    });
    ```

*   **Incorrect Container ID:** The CSS selector passed to the `CentralTerminal` constructor must exactly match the ID of the `div` in your HTML. Double-check for typos.

*   **Opening HTML with `file://`:** Modern web browsers block ES6 modules (which the terminal uses) from loading when you open an HTML file directly from your local filesystem (`file:///...`). **Solution:** You must serve your project from a local web server. The easiest way to do this is to use the `serve` package:

    ```bash
    # Make sure you are in your project directory
    npx serve
    ```

### 2. A Command or Addon Is Not Working

*   **Check for Typos:** Commands are case-sensitive. Use the `help` command to see a list of all available top-level commands.

*   **Check if the Addon Is Registered:** Addon commands like `edit` or `rps` will only work if the addon has been correctly imported and registered in your JavaScript file. Verify that you have a line like `term.registerAddon(new YourAddon());` before `term.boot()`.

*   **Check the Browser Console:** If an addon or command fails silently, open your browser's developer tools (usually with F12) and check the console for any error messages.

### 3. Filesystem Errors (`File not found`, etc.)

*   **Check the Path:** Paths in the terminal are case-sensitive. Use `pwd` to confirm your current directory and `ls` to see the files and folders around you. Remember that `~` is a shortcut for your home directory (`/home/user`).
*   **File Doesn't Exist:** Use `ls` to ensure the file you are trying to access actually exists in the specified directory.

## Frequently Asked Questions (FAQ)

### Q: How do I create a new file?

**A:** You can create an empty file with `touch my_file.txt` or create and write to a file using the `edit` addon (e.g., `edit my_file.txt`, type your content, and then use the `save` and `exit` commands inside the editor).

### Q: How do I see my command history?

**A:** Use the `history` command to see a list of your most recent commands. You can also use the Up and Down arrow keys to cycle through your history.

### Q: How can I clear the terminal screen?

**A:** Use the `clear` command to clear all output from the terminal screen. You can also use the keyboard shortcut `Ctrl+L`.
