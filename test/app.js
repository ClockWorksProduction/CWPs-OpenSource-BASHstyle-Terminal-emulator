import { CentralTerminal } from '/src/index.js';

document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminalOutput');
    const biosOutput = document.getElementById('bios-output');
    const commandInput = document.getElementById('terminal-command-input');

    const term = new CentralTerminal(terminalOutput, biosOutput, {
        enableInput: true,
        prompt: '$&gt; ',
    });

    // --- Boot Sequence ---
    term.print('BIOS loaded...\n');
    term.print('Initializing core systems...\n');

    // --- Boot Check Example ---
    term.addBootCheck({
        name: 'System Integrity Check',
        check: () => {
            return new Promise((resolve) => {
                setTimeout(() => resolve({ success: true, message: 'OK' }), 500);
            });
        }
    });

    term.runBootChecks().then(() => {
        term.print('\nWelcome to the CWP Terminal Emulator!\n');
        term.print('Type `help` to see a list of available commands.\n\n');
        commandInput.focus();
    });

    // --- Handle User Input ---
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = commandInput.value;
            term.print(`\n<span class="prompt">$&gt;</span> ${command}\n`); // Echo command
            term.run(command);
            commandInput.value = ''; // Clear input
            terminalOutput.scrollTop = terminalOutput.scrollHeight; // Scroll to bottom
        }
    });
});
