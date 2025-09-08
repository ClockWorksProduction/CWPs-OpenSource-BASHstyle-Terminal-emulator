# Addon Architecture (v5.1+)

The terminal features a powerful addon system that allows for the creation of self-contained sub-applications within the main terminal environment. Addons can have their own set of commands, manage their own state, and control their own lifecycle.

## Core Concepts

The addon system is built around two primary classes:

1.  **`Addon` (Base Class):** The foundation for all addons. It provides the core structure and functionality that the `AddonExecutor` uses to manage the addon.
2.  **`AddonExecutor`:** The manager responsible for registering, starting, stopping, and routing input to the active addon.

When an addon is active, the `AddonExecutor` hijacks the main terminal input. The prompt changes to indicate the active addon (e.g., `(edit)>`), and all user input is passed directly to the addon's `handleCommand` method instead of the main terminal's command processor.

## Creating a New Addon

To create a new addon, you must extend the base `Addon` class.

```javascript
// src/terminal.js

class MyCoolAddon extends Addon {
    constructor() {
        // 1. Call super() with the addon's name.
        // This name is used to invoke the addon via `run <name>`.
        super('mycool');

        // 2. Register addon-specific commands.
        // All addons automatically get 'help' and 'exit'.
        this.addCommand('dance', 'Perform a dance.', () => this.performDance());
        this.addCommand('status', 'Check dancer status.', () => this.checkStatus());

        // 3. Initialize any internal state.
        this.isDancing = false;
    }

    // (Optional) Called when the addon starts.
    onStart(args) {
        this.term.clear();
        this.term._print('MyCoolAddon has started! Arguments: ' + args.join(', '));
        this.commands.help.execute(); // Show addon-specific help
    }

    // (Optional) Called when the addon stops.
    onStop() {
        this.term._print('MyCoolAddon has stopped. Thanks for dancing!');
    }

    // --- Custom Methods ---
    performDance() {
        this.isDancing = true;
        this.term._print('\(^-^)/ KIRBY DANCE \(^-^)/');
    }

    checkStatus() {
        this.term._print(this.isDancing ? 'Currently dancing.' : 'Not dancing.');
    }
}
```

## Registering Your Addon

Once the addon class is created, you must register an instance of it with the `CentralTerminal`.

This is typically done in the main file where you initialize the terminal.

```javascript
// In your main application file (e.g., index.js)

import { CentralTerminal, MyCoolAddon } from './src/terminal.js';

const term = new CentralTerminal('#terminal-container');

// Register the addon instance
term.registerAddon(new MyCoolAddon());

// Boot the terminal
term.boot();
```

## Invoking the Addon

Addons are started using the built-in `run` command.

```bash
$ run mycool
(mycool)> dance
\(^-^)/ KIRBY DANCE \(^-^)/
(mycool)> status
Currently dancing.
(mycool)> exit
Returned to main terminal.
$
```
