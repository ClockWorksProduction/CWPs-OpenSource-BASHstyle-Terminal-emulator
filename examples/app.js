import { CentralTerminal, BootCheck, Command } from '../src/index.js';

// Import official addons
import { register as registerRPS } from '../addons/rps_addon.js';
import { register as registerEditor } from '../addons/editor.js';
import { register as registerPkgManager } from '../addons/pkg_manager.js';
import { register as registerTop } from '../addons/top.js';
import { register as registerNet } from '../addons/net.js';

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

// A command to handle Ctrl+C
const ctrlC = new Command('Ctrl+C', 'Exits the current addon', () => {
    if (terminal.addonExecutor.getActiveAddon()) {
        terminal.addonExecutor.getActiveAddon().onInput('Ctrl+C');
    }
});
terminal.addCommand(ctrlC);

// Register addons
registerRPS(terminal.addonExecutor);
registerEditor(terminal.addonExecutor);
registerPkgManager(terminal.addonExecutor);
registerTop(terminal.addonExecutor);
registerNet(terminal.addonExecutor);

terminal.boot();
