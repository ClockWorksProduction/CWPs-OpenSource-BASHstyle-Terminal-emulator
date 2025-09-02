import { CentralTerminal } from '../dist/terminal.js';
import { BootCheck } from '../dist/boot-checks.js';
import { Command } from '../dist/command.js';
import { ImageAddon } from './image-addon.js';

const terminal = new CentralTerminal('#pseudo-terminal');

// Add default boot checks
terminal.addBootCheck(new BootCheck("Memory Check", () => new Promise(resolve => setTimeout(() => resolve(true), 1000)), "Checks for memory allocation and integrity."));
terminal.addBootCheck(new BootCheck("VOS Integrity Check", () => new Promise(resolve => setTimeout(() => resolve(true), 500)), "Verifies the core VOS components."));
terminal.addBootCheck(new BootCheck("Addon Verification", () => new Promise(resolve => setTimeout(() => resolve(true), 1500)), "Checks all installed addons for compatibility."));
terminal.addBootCheck(new BootCheck("File System Check", () => new Promise(resolve => setTimeout(() => resolve(true), 1000)), "Scans the file system for errors."));
terminal.addBootCheck(new BootCheck("Network Connection", () => new Promise(resolve => setTimeout(() => resolve(true), 2000)), "Pings the main server to ensure connectivity."));

// Add a custom command
const cowsay = new Command('cowsay', 'Displays a cow with a message.', (args) => {
    const message = args.join(' ') || 'Moo!';
    const cow = `
        <pre>
         \   ^__^
          \  (oo)\_______
             (__)\       )\/\
                 ||----w |
                 ||     ||
        </pre>
    `;
    terminal.printHtml(`${message}${cow}`);
});
terminal.addCommand(cowsay);

// Register addons
terminal.registerAddon(new ImageAddon());

terminal.boot();
