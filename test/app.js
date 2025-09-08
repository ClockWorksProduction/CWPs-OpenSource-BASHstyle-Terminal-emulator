
import { CentralTerminal, EditorAddon, RpsAddon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize the Terminal by passing in the ID of the container element
    const term = new CentralTerminal('#central-terminal-container');
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    await term.boot();

    term._print("\nCWP Open Terminal Emulator v5.1.5");
    term._print("(c) 2025 ClockWorks Production Studio");
    term._print("Type 'help' to see available commands.\n");
  } catch (error) {
    console.error("Failed to initialize terminal:", error);
    const container = document.querySelector('#central-terminal-container');
    if (container) {
      container.innerHTML = \`
        <div style="color: red; font-family: monospace; padding: 1em;">
          <h2>Error Initializing Terminal</h2>
          <p><strong>Error:</strong> \${error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      \`;
    }
  }
});
