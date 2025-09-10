class TerminalUI {
    constructor(containerSelector, onCommand, onAutocomplete = null, options = {}) {
      const container = document.querySelector(containerSelector);
      if (!container) throw new Error(`Terminal container element not found: ${containerSelector}`);
  
      this.container = container;
      this.onCommand = onCommand;
      this.onAutocomplete = onAutocomplete;
      this._ctrlCHandler = null;
  
      // Check for mapped DOM elements
      this.output  = options.outputSelector ? document.querySelector(options.outputSelector) : null;
      this.prompt  = options.promptSelector ? document.querySelector(options.promptSelector) : null;
      this.input   = options.inputSelector  ? document.querySelector(options.inputSelector)  : null;
  
      // If no custom elements were provided, fall back to auto-generation
      if (!this.output || !this.prompt || !this.input) {
        this.container.innerHTML = '';
        this.container.style.fontFamily = 'monospace';
        this.container.style.backgroundColor = 'black';
        this.container.style.color = '#eee';
        this.container.style.padding = '5px';
  
        this.output = document.createElement('div');
        const inputLine = document.createElement('div');
        this.prompt = document.createElement('span');
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.style.background = 'transparent';
        this.input.style.border = 'none';
        this.input.style.color = 'inherit';
        this.input.style.fontFamily = 'inherit';
        this.input.style.width = '80%';
  
        inputLine.appendChild(this.prompt);
        inputLine.appendChild(this.input);
        this.container.appendChild(this.output);
        this.container.appendChild(inputLine);
      }
  
      // Bind key events
      this.input.addEventListener('keydown', (e) => {
        // Ctrl+C handling
        if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          if (typeof this._ctrlCHandler === 'function') this._ctrlCHandler();
          return;
        }
  
        if (e.key === 'Enter') {
          const command = this.input.value;
          this.input.value = '';
          if (typeof this.onCommand === 'function') this.onCommand(command);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (typeof this.onAutocomplete === 'function') this.onAutocomplete();
        }
      });
  
      // Focus the input when terminal is clicked
      this.container.addEventListener('click', () => this.input.focus());
      this.input.focus();
    }
  
    clearTerminal() { this.output.innerHTML = ''; }
  
    appendTerminalOutput(text, isLine = true) {
      const element = document.createElement('div');
      element.innerHTML = text;
      this.output.appendChild(element);
    
      // ✅ scroll the output div
      this.output.scrollTop = this.output.scrollHeight;
    }  
  
    setPrompt(promptText) { this.prompt.innerHTML = promptText; }
    registerCtrlC(handler) { this._ctrlCHandler = handler; }
}

export { TerminalUI };
