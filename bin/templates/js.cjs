module.exports = function jsTemplate(opts = {}) {
  return `import { CentralTerminal, EditorAddon, RpsAddon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

document.addEventListener('DOMContentLoaded', async () => {
    const crtContainer = document.querySelector('.crt-container');
    const crtOverlay = document.querySelector('.crt-overlay');
    const crtNoise = document.querySelector('.crt-noise');

    function applyJitter() {
        const jitterClass = 'jitter';
        let isJittering = false;

        setInterval(() => {
            if (Math.random() > 0.95) {
                if (!isJittering) {
                    crtContainer.classList.add(jitterClass);
                    isJittering = true;

                    setTimeout(() => {
                        crtContainer.classList.remove(jitterClass);
                        isJittering = false;
                    }, 50 + Math.random() * 150);
                }
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

    function generateNoise() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() < 0.5 ? 0 : 255;
            data[i] = value;
            data[i+1] = value;
            data[i+2] = value;
            data[i+3] = 255;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        crtNoise.style.backgroundImage = \`url('${canvas.toDataURL()}')\`;
        crtNoise.style.backgroundRepeat = 'repeat';
    }

    applyJitter();
    applyFlicker();
    generateNoise();

  try {
    const term = new CentralTerminal("${opts.container || '#pseudo-terminal'}", {
      inputSelector: "${opts.input || '#terminal-command-input'}",
      outputSelector: "${opts.output || '#terminalOutput'}",
      promptSelector: "${opts.prompt || '#terminal-prompt'}"
    });

    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    await term.boot();

    term._print("Welcome to the Central Terminal! Have a great day!\n");
    term._print("CWP Open Terminal Emulator v5.2.5");
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
    console.error(\"Failed to initialize terminal:\", err);
    const container = document.querySelector("${opts.container || '#pseudo-terminal'}");
    if(container) {
      container.innerHTML = \`<div style=\"color:red;font-family:monospace;padding:1em;\">\
        <h2>Error Initializing Terminal</h2>\
        <p><strong>Error:</strong> \${err.message}</p>\
        <p>Check console for details.</p>\
      </div>\`;
    }
  }
});
`;
};
