# Addon System

The CWP Open Terminal Emulator features a powerful addon system that allows you to create your own commands and applications that run inside the terminal.

## Creating an Addon

To create an addon, you need to create a new class that extends the `Addon` base class.

```javascript
import { Addon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

class MyAddon extends Addon {
    constructor() {
        super('myaddon'); // The name of the addon
    }

    onStart(term, vOS, ...args) {
        this.term.print("Welcome to My Addon!");
        this.term.print("Type 'hello' or 'goodbye'.");
    }

    onCommand(input) {
        if (input.toLowerCase() === 'hello') {
            this.term.print("Hello, World!");
        } else if (input.toLowerCase() === 'goodbye') {
            this.term.print("Goodbye!");
        } else {
            this.term.print(`Unknown command: ${input}`);
        }
    }

    onStop() {
        this.term.print("Exiting My Addon.");
    }
}
```

## Registering an Addon

Once you have created your addon, you need to register it with the terminal instance.

```javascript
import { CentralTerminal } from '@clockworksproduction-studio/cwp-open-terminal-emulator';
import MyAddon from './my-addon.js';

const term = new CentralTerminal('#terminal-container');
term.registerAddon(new MyAddon());
term.boot();
```

## Running an Addon

To run the addon, use the `run` command in the terminal.

```bash
run myaddon
```

This will start the addon and you will see the "Welcome to My Addon!" message. You can then use the `hello` and `goodbye` commands. To exit the addon and return to the main terminal, use the `exit` command.
