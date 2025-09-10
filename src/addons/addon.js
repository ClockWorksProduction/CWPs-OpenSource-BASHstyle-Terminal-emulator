class Addon {
    constructor(name) {
      if (!name) throw new Error("Addon must have a name.");
      this.name = name;
      this.term = null;
      this.vOS = null;
      this.commands = {}; // Each addon has its own commands
  
      // Add default commands common to all addons
      this.addCommand('exit', 'Exit the current addon', () => this.exit());
      this.addCommand('help', 'Show help for this addon', () => {
          this.term._print(`Available commands within '${this.name}':\n`);
          const longest = Math.max(...Object.keys(this.commands).map(n => n.length));
          Object.values(this.commands)
            .sort((a,b) => a.name.localeCompare(b.name))
            .forEach(c => this.term._print(`${c.name.padEnd(longest)} - ${c.desc}`));
      });
    }
  
    // Add a command to the addon
    addCommand(name, desc, exec) {
        this.commands[name] = { name, desc, execute: exec };
    }
  
    // Internal initialization
    _init(term, vOS) {
      this.term = term;
      this.vOS = vOS;
    }
  
    // Called when addon starts. To be overridden by subclasses.
    onStart(args) {}
  
    // Handles input, parsing it into commands for the addon.
    handleCommand(input) {
      const parts = input.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g) || [];
      if (!parts) return;
      
      const name = (parts.shift() || '').replace(/['"]/g, '').toLowerCase();
      const args = parts.map(a => a.replace(/['"]/g, ''));
  
      const cmd = this.commands[name];
      if (cmd) {
        cmd.execute(args, this.term, this.vOS);
      } else if (name) {
        this.term._print(`${this.name}: ${name}: command not found`);
      }
    }
  
    // Called when addon stops. To be overridden.
    onStop() {}
  
    // Exits the addon, returning control to the main terminal.
    exit() {
      if (this.term && this.term.addonExecutor.activeAddon === this) {
        this.term.addonExecutor.stop();
      }
    }
}

export { Addon };
