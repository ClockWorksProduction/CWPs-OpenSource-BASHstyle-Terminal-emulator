import { nowISO, deepClone, CentralTerminal, TerminalUI, BootCheck, BootCheckRegistry, BootHandler, VOS, VFile, VDirectory, Addon, AddonExecutor, EditorAddon, RpsAddon } from '../src/index.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- Terminal Setup ---
    const term = new CentralTerminal('#pseudo-terminal', {
        inputSelector: '#terminal-command-input',
        outputSelector: '#terminalOutput',
        promptSelector: '#terminal-prompt'
    });

    // --- Register Addons ---
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());

    // --- register coustom dir ---
    try {
      const response = await fetch('./test/vfs.json'); // Corrected Path
      const vfsData = await response.json();
      // Assign a NEW VOS instance created from the JSON to the terminal
      term.vOS = VOS.fromJSON(vfsData);
    } catch (error) {
      console.error('Failed to load Virtual File System:', error);
    }

    // --- (TEST) Set Custom Boot Text ---
    // This demonstrates how to override the default BIOS screen.
    const customBootText = `
==================================
  CUSTOMIZED TEST BOOTLOADER
==================================
  BIOS Version: 2.1.0-test
  Build: 20240510

  Initializing custom test suite...
`;
    term.setBootupText(customBootText);

    // --- (TEST) Add a Custom Boot Check ---
    // This demonstrates how to add a new check to the boot sequence.
    const myCheck = new BootCheck(
      'Pinging custom API endpoint',
      async () => {
        // Fake a delay for a network request
        await new Promise(r => setTimeout(r, 300)); 
        // In a real scenario, you might fetch() a status endpoint.
        // We'll just simulate a successful check.
        return true;
      }
    );
    term.bootRegistry.add(myCheck);


    // --- Start the Boot Sequence ---
    try {
        // The .boot() method runs the full animation and all registered checks.
        await term.boot();
        console.log('Terminal boot sequence complete.');

    } catch (err) {
        console.error('An error occurred during the terminal boot sequence:', err);
        const termOutput = document.getElementById('terminalOutput');
        if (termOutput) {
            termOutput.innerHTML = `<div style="color: #f00;">FATAL: Could not initialize terminal. See console for details.</div>`;
        }
    }
});
