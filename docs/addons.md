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

Addons are created by extending the `Addon` class and implementing the required methods. The following is a basic addon template:

```javascript
import { Addon } from '/src/index.js';

class MyAddon extends Addon {
    constructor() {
        super('mycommand');
    }

    onStart(term, vOS, ...args) {
        super.onStart(term, vOS, ...args);
        this.term.print('My addon has started!');
        this.term.print(`Arguments received: ${args.join(', ')}`);
        this.exit();
    }

    onCommand(input) {
        if (input.toLowerCase() === 'quit') {
            this.exit();
        } else {
            this.term.print(`You typed: ${input}`);
        }
    }

    onStop() {
        this.term.print('My addon is stopping.');
    }
}

export function register(addonExecutor) {
    addonExecutor.registerAddon(new MyAddon());
}
```

For more detailed information on creating addons, please refer to the [Contributing Guidelines](../CONTRIBUTING.md).
