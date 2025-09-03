# Contributing to CWP Open Terminal Emulator

First off, thank you for considering contributing to the project! We welcome any help, from reporting a bug to submitting a feature.

## How to Contribute

- **Reporting Bugs**: If you find a bug, please open an issue with as much detail as possible.
- **Suggesting Enhancements**: Open an issue to discuss new features or improvements.
- **Submitting Pull Requests**: If you want to contribute code, please follow the guidelines below.

## Submitting Pull Requests

1.  Fork the repository and create a new branch.
2.  Write your code, following the style guidelines.
3.  Ensure your changes do not break existing functionality.
4.  Submit a pull request with a clear description of your changes.

## Creating Addons

Addons are the primary way to extend the terminal's functionality. They are self-contained modules that register new commands.

### Addon Structure

An addon is a JavaScript file that exports a `register` function. This function takes the terminal's `addonExecutor` as an argument.

Here is a basic addon template (`my_addon.js`):

```javascript
import { Addon } from '/src/index.js'; // Always import from the absolute path

// 1. Create a class that extends the base Addon
class MyAddon extends Addon {
    constructor() {
        super('mycommand'); // The command that will trigger the addon
    }

    // 2. Implement the onStart method
    onStart(term, vOS, ...args) {
        super.onStart(term, vOS, ...args);
        this.term.print('My addon has started!');
        this.term.print(`Arguments received: ${args.join(', ')}`);

        // Use this.exit() to return control to the main terminal
        this.exit();
    }

    // (Optional) Implement onCommand for interactive addons
    onCommand(input) {
        if (input.toLowerCase() === 'quit') {
            this.exit();
        } else {
            this.term.print(`You typed: ${input}`);
        }
    }

    // (Optional) Implement onStop for cleanup
    onStop() {
        this.term.print('My addon is stopping.');
    }
}

// 3. Export a register function
export function register(addonExecutor) {
    addonExecutor.registerAddon(new MyAddon());
}
```

### Best Practices for Addons

*   **Keep Addons Focused**: Each addon should have a single, clear purpose.
*   **Use `this.exit()`**: Always call `this.exit()` when your addon's task is complete to return control to the main terminal.
*   **Provide Help**: Use the `onStart` method to print usage instructions if no arguments are provided.
*   **Import from Absolute Paths**: Always use `import { Addon } from '/src/index.js';` to ensure your addon can find the core library.

## License for Contributions

All contributions must be licensed under the **GNU Lesser General Public License v3.0 or later (LGPLv3+)**. By submitting a pull request, you agree to license your work under these terms.
