import { CentralTerminal, EditorAddon, RpsAddon } from '../src/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  const crtContainer = document.querySelector('.crt-container');
  const crtOverlay = document.querySelector('.crt-overlay');

  function applyJitter() {
    const jitterClass = 'jitter';
    let isJittering = false;
    setInterval(() => {
      if (Math.random() > 0.95 && !isJittering) {
        crtContainer.classList.add(jitterClass);
        isJittering = true;
        setTimeout(() => {
          crtContainer.classList.remove(jitterClass);
          isJittering = false;
        }, 50 + Math.random() * 150);
      }
    }, 100);
  }

  function applyFlicker() {
    const flickerClass = 'flicker';
    setInterval(() => {
      if (Math.random() > 0.8) {
        crtOverlay.classList.toggle(flickerClass);
        setTimeout(() => {
          crtOverlay.classList.remove(flickerClass);
        }, 50);
      }
    }, 100);
  }

  // Initialize CRT effects
  applyJitter();
  applyFlicker();

  // --- Terminal boot (unchanged) ---
  try {
    const term = new CentralTerminal('#pseudo-terminal', {
      inputSelector: '#terminal-command-input',
      outputSelector: '#terminalOutput',
      promptSelector: '#terminal-prompt'
    });

    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    await term.boot();

    term._print("Welcome to the Central Terminal! Have a great day!\n");
    term._print("CWP Open Terminal Emulator v5.2.5");
    term._print("(c) 2025 ClockWorks Production Studio");
    term._print("Type 'help' to see available commands.\n");
  } catch (err) {
    console.error("Failed to initialize terminal:", err);
  }
});
