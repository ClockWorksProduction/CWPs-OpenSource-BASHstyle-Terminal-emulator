import { CentralTerminal } from '../src/index.js';

document.addEventListener('DOMContentLoaded', () => {
    // Create a new terminal instance. The class now handles its own internal setup.
    const term = new CentralTerminal('#central-terminal-container');

    // The boot method now handles the entire startup sequence.
    term.boot();
});
