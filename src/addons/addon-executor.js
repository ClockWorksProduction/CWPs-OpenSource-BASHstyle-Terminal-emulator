import { Addon } from '../index.js';

class AddonExecutor {
    constructor(term, vOS) {
      this.term = term;
      this.vOS = vOS;
      this.registered = {};
      this.activeAddon = null;
    }
  
    register(addonInstance) {
      if (!(addonInstance instanceof Addon)) {
        console.error("Attempted to register invalid addon.", addonInstance);
        return;
      }
      addonInstance._init(this.term, this.vOS);
      this.registered[addonInstance.name] = addonInstance;
    }
  
    start(name, args) {
      const addon = this.registered[name];
      if (!addon) {
        this.term._print(`bash: ${name}: addon not found`);
        return;
      }
      this.activeAddon = addon;
      this.activeAddon.onStart(args);
      this.term.ui.setPrompt(this.term.prompt());
    }
  
    stop() {
      if (!this.activeAddon) return;
      const addon = this.activeAddon;
      this.activeAddon = null; // Set to null *before* onStop to prevent re-entry issues
      addon.onStop();
      this.term.ui.setPrompt(this.term.prompt());
    }
  
    handleCommand(input) {
      if (this.activeAddon) {
        this.term.ui.appendTerminalOutput(`${this.term.prompt()}${input}`);
        this.activeAddon.handleCommand(input);
        return true;
      }
      return false;
    }
  
    isActive() { return !!this.activeAddon; }
}

export { AddonExecutor };
