import { CentralTerminal, Addon, Command } from '../CWP_OpenTerminalEmmulator_CORE/dist/terminal.js';

// 1. Initialize the Terminal
const term = new CentralTerminal('#central-terminal-container');

// 2. (Optional) Create a custom addon
class GreeterAddon extends Addon {
    constructor() {
        super('greet');
    }

    onStart(term, vOS, name) {
        this.term.print(`Hello, ${name || 'World'}!`);
        this.term.print("This is a custom addon. Type 'exit' to return to the main terminal.");
    }
}

// 3. (Optional) Register the addon
term.registerAddon(new GreeterAddon());

// 4. (Optional) Add a new command to the main terminal
term.addCommand(new Command('hello', 'Says hello.', (args) => {
    term.print(`Hello, ${args[0] || 'stranger'}!`);
}));

// 5. Boot the terminal
term.boot();
