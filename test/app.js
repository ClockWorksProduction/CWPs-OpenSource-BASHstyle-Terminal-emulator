import { CentralTerminal } from '../src/index.js';

document.addEventListener('DOMContentLoaded', () => {
    const term = new CentralTerminal('#central-terminal-container');
    term.boot();
});
