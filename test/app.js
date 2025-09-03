import { CentralTerminal } from '../src/index.js';

document.addEventListener('DOMContentLoaded', () => {
    const term = new CentralTerminal('#central-terminal-container');
    const commandInput = document.getElementById('terminal-command-input');
    const terminalOutput = document.getElementById('terminalOutput');

    // The boot() method handles all BIOS-level output. These are not needed.
    // term.print('BIOS loaded...\n');
    // term.print('Initializing core systems...\n');

    term.addBootCheck({
        name: 'System Integrity Check',
        check: () => {
            return new Promise((resolve) => {
                setTimeout(() => resolve({ success: true, message: 'OK' }), 500);
            });
        }
    });

    term.boot().then(() => {
        // Print welcome messages correctly, relying on the new print() method for newlines.
        term.print('Welcome to the CWP Terminal Emulator!');
        term.print("Type 'help' to see a list of available commands.");
        term.print(''); // Add a blank line for spacing.
        commandInput.focus();
    });

    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = commandInput.value;
            // Echo the command with the prompt for a clean, consistent look.
            term.print(`S> ${command}`);
            term.runCommand(command);
            commandInput.value = '';
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });
});
