import { CentralTerminal } from '../src/index.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const term = new CentralTerminal('#central-terminal-container');
        term.boot();
    } catch (e) {
        console.error("Error booting terminal:", e);
        const container = document.querySelector('#central-terminal-container');
        if (container) {
            container.innerHTML = `<div style="color: red; font-family: monospace; padding: 1em;"><h2>Failed to load terminal</h2><p>${e.message}</p></div>`;
        }
    }
});
