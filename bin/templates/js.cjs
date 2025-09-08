module.exports = function jsTemplate(opts = {}) {
  return `
import { CentralTerminal, EditorAddon, RpsAddon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const term = new CentralTerminal("${opts.container || '#pseudo-terminal'}", {
      inputSelector: "${opts.input || '#terminal-command-input'}",
      outputSelector: "${opts.output || '#terminalOutput'}",
      promptSelector: "${opts.prompt || '#terminal-prompt'}"
    });

    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    await term.boot();

    term._print("\\nCWP Open Terminal Emulator v5.2.5");
    term._print("(c) 2025 ClockWorks Production Studio");
    term._print("Type 'help' to see available commands.\\n");

    const inputField = document.querySelector("${opts.input || '#terminal-command-input'}");
    if(inputField) inputField.focus();

    const output = document.querySelector("${opts.output || '#terminalOutput'}");
    if(output) {
      const observer = new MutationObserver(() => {
        output.scrollTop = output.scrollHeight;
      });
      observer.observe(output, { childList: true, subtree: true });
    }
  } catch (err) {
    console.error("Failed to initialize terminal:", err);
    const container = document.querySelector("${opts.container || '#pseudo-terminal'}");
    if(container) {
      container.innerHTML = \`<div style="color:red;font-family:monospace;padding:1em;">
        <h2>Error Initializing Terminal</h2>
        <p><strong>Error:</strong> \${err.message}</p>
        <p>Check console for details.</p>
      </div>\`;
    }
  }
});
`;
};
