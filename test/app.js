import { CentralTerminal, EditorAddon, RpsAddon } from '../src/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const term = new CentralTerminal("#pseudo-terminal", {
      inputSelector: "#terminal-command-input",
      outputSelector: "#terminalOutput",
      promptSelector: "#terminal-prompt"
    });

    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    await term.boot();

    term._print("\nCWP Open Terminal Emulator v5.2.5");
    term._print("(c) 2025 ClockWorks Production Studio");
    term._print("Type 'help' to see available commands.\n");

    const inputField = document.querySelector("#terminal-command-input");
    if(inputField) inputField.focus();

    const output = document.querySelector("#terminalOutput");
    if(output) {
      const observer = new MutationObserver(() => {
        output.scrollTop = output.scrollHeight;
      });
      observer.observe(output, { childList: true, subtree: true });
    }
  } catch (err) {
    console.error("Failed to initialize terminal:", err);
    const container = document.querySelector("#pseudo-terminal");
    if(container) {
      container.innerHTML = `<div style="color:red;font-family:monospace;padding:1em;">
        <h2>Error Initializing Terminal</h2>
        <p><strong>Error:</strong> ${err.message}</p>
        <p>Check console for details.</p>
      </div>`;
    }
  }
});
