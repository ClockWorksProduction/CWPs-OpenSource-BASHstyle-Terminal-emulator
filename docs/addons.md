# Addon System

This document describes the addon system for the CWP Open Terminal Emulator.

Addons are self-contained modules that extend the functionality of the terminal. They can be used to add new commands, create interactive experiences, and more.

## Official Addons

The CWP Open Terminal Emulator comes with a suite of official addons that are available to be used out of the box:

*   `edit`: A simple text editor for creating and editing files.
*   `tpkg`: A package manager for installing, updating, and removing addons.
*   `top`: A system monitor that displays information about the terminal's performance.
*   `rps`: A simple rock-paper-scissors game.
*   `net`: A collection of network tools for inspecting and interacting with the terminal's virtual network.

## Creating Addons

Addons are created by extending the `Addon` class and implementing the required methods. The addon system is designed to be simple and flexible, allowing you to create powerful extensions for the terminal.

For more detailed information on the addon API, please refer to the [API Reference](./api-reference.md).

### Basic Addon Template

The following is a basic addon template that demonstrates the core concepts of the addon system:

```javascript
import { Addon } from '/src/index.js';

class MyAddon extends Addon {
    constructor() {
        // The command that will be used to launch the addon
        super('mycommand');
    }

    // Called when the addon is started
    onStart(term, vOS, ...args) {
        super.onStart(term, vOS, ...args);
        this.term.print('My addon has started!');
        this.term.print(`Arguments received: ${args.join(', ')}`);

        // Set the prompt to indicate that the addon is active
        this.term.setPrompt('myaddon> ');
    }

    // Called for every command the user enters while the addon is active
    onCommand(input) {
        if (input.toLowerCase() === 'quit') {
            this.exit(); // Use this.exit() to stop the addon
            return;
        }
        this.term.print(`You typed: ${input}`);
    }

    // Called when the addon is stopped
    onStop() {
        this.term.print('My addon is stopping.');
        this.term.resetPrompt(); // Reset the prompt to its default state
    }
}

// Register the addon with the terminal's addon executor
export function register(addonExecutor) {
    addonExecutor.registerAddon(new MyAddon());
}
```

### Contributing Addons

If you create an addon that you think would be a good addition to the official addon suite, we welcome contributions! Please read our [Contributing Guidelines](../CONTRIBUTING.md) for more details on the development process.
