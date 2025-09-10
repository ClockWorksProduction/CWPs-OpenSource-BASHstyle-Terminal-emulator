module.exports = function jsTemplate({ inputSelector, outputSelector, promptSelector }) {
  return `import { CentralTerminal } from \'@clockworksproduction-studio/cwp-open-terminal-emulator/core/central-terminal.js\';
import { EditorAddon } from \'@clockworksproduction-studio/cwp-open-terminal-emulator/addons/editor-addon.js\';
import { RpsAddon } from \'@clockworksproduction-studio/cwp-open-terminal-emulator/addons/rps-addon.js\';
import { BootCheck } from \'@clockworksproduction-studio/cwp-open-terminal-emulator/boot/boot-check.js\';

document.addEventListener(\\'DOMContentLoaded\\', async () => {
  const rootElement = \\'#cwp-terminal-emulator-root\_\_';
  
  try {
    const term = new CentralTerminal(rootElement, {
      inputSelector: \\'${inputSelector}\\',
      outputSelector: \\'${outputSelector}\\',
      promptSelector: \\'${promptSelector}\\'
    });

    // --- Register Addons ---
    // You can create your own addons by extending the Addon class.
    // See the documentation for more details.
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());

    // --- Customize Boot Sequence (Optional) ---
    // You can add your own asynchronous checks to the boot sequence.
    /*
    const myCheck = new BootCheck(\\'Checking for updates\\', async () => {
      await new Promise(r => setTimeout(r, 500));
      return true; // Return false to indicate a failure
    });
    term.bootRegistry.add(myCheck);
    */

    // You can also customize the bootup text entirely.
    /*
    term.setBootupText(\`
    MY CUSTOM BIOS v1.0
    -------------------
    Initializing...
    \`);
    */

    // --- Boot the Terminal ---
    // The boot() method runs the full animation and all registered checks.
    await term.boot();

    // --- Post-Boot Welcome Message ---
    // The default /etc/motd is printed automatically after boot.
    // You can add your own custom messages here.
    term._print("Type 'help' to see available commands.\\\\n");

  } catch (err) {
    console.error("Fatal: Failed to initialize terminal:", err);
    const root = document.querySelector(rootElement);
    if(root) {
      root.innerHTML = \\'<div style="color: #ff4d4d; font-family: monospace; padding: 1em;"><strong>FATAL ERROR</strong><br>Could not initialize terminal.<br>See browser console (F12) for technical details.</div>\_\_';
    }
  }
});
`;
};
