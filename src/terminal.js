// CentralTerminal v5.1.5 — fixed version
// - POSIX pathing throughout
// - Client-side only terminal emulator (virtual FS, simple UI)

const nowISO = () => new Date().toISOString();
const deepClone = obj => JSON.parse(JSON.stringify(obj));

// ---------- Virtual FS ----------
class VFile {
  constructor(name, content = '', ftype = 'text', mode = 0o644) {
    this.kind = 'file';
    this.name = name;
    this.content = content;
    this.ftype = ftype;
    this.mode = mode;
    this.ctime = nowISO();
    this.mtime = this.ctime;
  }
}

class VDirectory {
  constructor(name) {
    this.kind = 'dir';
    this.name = name;
    this.children = {};
  }
  getChild(name) { return this.children[name]; }
}

class VOS {
  constructor() {
    this.root = new VDirectory('');
    this.homePath = '/home/user';
    this._seed(); // Seed first
    this.cwd = this.resolve(this.homePath) || this.root; // FIX: Set cwd AFTER seeding.
  }

  // Serialization
  toJSON() {
    const encode = node => {
      if (node.kind === 'dir') {
        const out = { kind: 'dir', name: node.name, children: {} };
        for (const [k, v] of Object.entries(node.children)) out.children[k] = encode(v);
        return out;
      }
      return deepClone({ kind: 'file', name: node.name, content: node.content, ftype: node.ftype, mode: node.mode, ctime: node.ctime, mtime: node.mtime });
    };
    return { root: encode(this.root), cwd: this.pathOf(this.cwd), homePath: this.homePath };
  }

  static fromJSON(json) {
    const decode = obj => {
      if (obj.kind === 'dir') {
        const d = new VDirectory(obj.name);
        for (const [k, v] of Object.entries(obj.children || {})) d.children[k] = decode(v);
        return d;
      }
      const f = new VFile(obj.name, obj.content, obj.ftype, obj.mode);
      f.ctime = obj.ctime; f.mtime = obj.mtime;
      return f;
    };
    const vos = new VOS();
    vos.root = decode(json.root);
    vos.cwd = vos.resolve(json.cwd) || vos._mkdirp('/');
    vos.homePath = json.homePath || '/';
    return vos;
  }

  // Helpers
  _seed() {
    this.mkdir('/home');
    this.mkdir('/home/user'); // FIX: create user's home directory
    this.mkdir('/bin'); this.mkdir('/etc'); this.mkdir('/docs'); this.mkdir('/media');
    this.mkdir('/media/images'); this.mkdir('/media/audio');
    this.writeFile('/etc/motd', 'Welcome to the Central Terminal!\n\nHave a great day!');
    const demo = `# Welcome to the Virtual File System!\n\nUse commands: ls, cd, cat, tree.\nEnjoy!\n`;
    this.writeFile('/docs/guide.txt', demo);
  }

  normalize(path) {
    if (!path) return this.pathOf(this.cwd);
    if (path.startsWith('~')) path = path.replace('~', this.homePath);
    const abs = path.startsWith('/') ? path : this.pathOf(this.cwd) + '/' + path;
    const parts = abs.split('/');
    const stack = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') stack.pop();
      else stack.push(part);
    }
    return '/' + stack.join('/');
  }

  resolve(path) {
    const norm = this.normalize(path);
    if (norm === '/') return this.root;
    const segs = norm.split('/').filter(Boolean);
    let cur = this.root;
    for (const s of segs) {
      if (!(cur instanceof VDirectory)) return null;
      cur = cur.children[s];
      if (!cur) return null;
    }
    return cur;
  }

  parentOf(path) {
    const norm = this.normalize(path);
    if (norm === '/') return null;
    const up = norm.slice(0, norm.lastIndexOf('/')) || '/';
    return this.resolve(up);
  }

  pathOf(node) {
    const path = [];
    const dfs = (cur, target, acc) => {
      if (cur === target) { path.push(...acc); return true; }
      if (cur.kind !== 'dir') return false;
      for (const [name, child] of Object.entries(cur.children)) {
        if (dfs(child, target, [...acc, name])) return true;
      }
      return false;
    };
    if (node === this.root) return '/';
    dfs(this.root, node, []);
    return '/' + path.join('/');
  }

  _mkdirp(path) {
    const norm = this.normalize(path);
    if (norm === '/') return this.root;
    const segs = norm.split('/').filter(Boolean);
    let cur = this.root;
    for (const s of segs) {
      if (!cur.children[s]) cur.children[s] = new VDirectory(s);
      cur = cur.children[s];
      if (!(cur instanceof VDirectory)) throw new Error('ENOTDIR: not a directory, ' + s);
    }
    return cur;
  }

  mkdir(path) {
    const parent = this.parentOf(path);
    if (!(parent instanceof VDirectory)) return false;
    const name = this.normalize(path).split('/').filter(Boolean).pop();
    if (parent.children[name]) return false;
    parent.children[name] = new VDirectory(name);
    return true;
  }

  rmdir(path) {
    const dir = this.resolve(path);
    if (!(dir instanceof VDirectory)) return false;
    if (Object.keys(dir.children).length) return false;
    const parent = this.parentOf(path);
    if (!parent) return false;
    delete parent.children[dir.name];
    return true;
  }

  writeFile(path, content = '', ftype = 'text', overwrite = true) {
    const parent = this.parentOf(path);
    if (!(parent instanceof VDirectory)) return false;
    const name = this.normalize(path).split('/').filter(Boolean).pop();
    const exists = parent.children[name];
    if (exists) {
      if (!(exists instanceof VFile)) return false;
      if (!overwrite) return false;
      exists.content = content;
      exists.mtime = nowISO();
      exists.ftype = ftype;
      return true;
    }
    parent.children[name] = new VFile(name, content, ftype);
    return true;
  }

  readFile(path) {
    const node = this.resolve(path);
    if (node instanceof VFile) return node.content;
    return null;
  }

  unlink(path) {
    const parent = this.parentOf(path);
    const node = this.resolve(path);
    if (!(parent instanceof VDirectory) || !(node instanceof VFile)) return false;
    delete parent.children[node.name];
    return true;
  }

  ls(path = '.') {
    const dir = this.resolve(path);
    if (!(dir instanceof VDirectory)) return null;
    return Object.values(dir.children).map(c => c.kind === 'dir' ? c.name + '/' : c.ftype === 'exe' ? c.name + '*' : c.name).sort();
  }

  chdir(path) {
    const dir = this.resolve(path);
    if (dir instanceof VDirectory) { this.cwd = dir; return true; }
    return false;
  }
}

// ---------- Boot Handler (CORRECTED) ----------
class BootHandler {
  constructor(terminal) {
      this.term = terminal;
      this.bootupTextElement = document.getElementById('bootup-text');
      this.loadingBar = document.getElementById('loading-bar');
      this.screens = document.querySelectorAll('.screen');
      this.glitchOverlay = document.getElementById('glitch-overlay');
      this.typingSpeed = 10;
      this.glitchDuration = 300;
      this.bootupText = terminal.customBootupText || `
      CWP Open Terminal BIOS v5.x.x
      -----------------------------------
      Initializing system...
      `;      
  }

  run() {
      return new Promise(resolve => {
          this.startBootupAnimation().then(() => resolve());
      });
  }

  showScreen(screenId) {
      this.screens.forEach(screen => {
          if (screen) screen.classList.remove('active');
      });
      const screenToShow = document.getElementById(screenId);
      if (screenToShow) {
          screenToShow.classList.add('active');
      }
  }

  async startBootupAnimation() {
      this.showScreen('bootup-screen');
      if (!this.bootupTextElement) {
          return this.runBootChecks();
      }

      await this.typeText(this.bootupText);
      const bootSuccess = await this.runBootChecks();

      if (bootSuccess) {
          await this.typeText('\nSystem ready. Initializing user session...\n');
          await this.startLoadingScreen();
      } else {
          await this.typeText('\n<span class="status-failed">A critical error occurred. System halted.</span>');
          return Promise.reject("Boot failed");
      }
  }

  typeText(text) {
      return new Promise(resolve => {
          if (!this.bootupTextElement) return resolve();
          let i = 0;
          const typingInterval = setInterval(() => {
              if (i < text.length) {
                  this.bootupTextElement.innerHTML += text.charAt(i);
                  i++;
              } else {
                  clearInterval(typingInterval);
                  setTimeout(resolve, 200); // Small pause after typing
              }
          }, this.typingSpeed);
      });
  }

  runBootChecks() {
    // The registry now receives the DOM element directly
    // to manage the line-by-line display of checks.
    return this.term.bootRegistry.run(this.bootupTextElement);
  }
  
  startLoadingScreen() {
      return new Promise(resolve => {
          this.showScreen('loading-screen');
          if (!this.loadingBar) return resolve();
          
          let width = 0;
          const loadingInterval = setInterval(() => {
              width += Math.random() * 4;
              if (width >= 100) {
                  width = 100;
                  this.loadingBar.style.width = width + '%';
                  clearInterval(loadingInterval);
                  // FIXED: Added a 500ms pause here to ensure the full bar is visible
                  setTimeout(() => {
                      this.triggerGlitchTransition(resolve);
                  }, 500);
              } else {
                  this.loadingBar.style.width = width + '%';
              }
          }, 50);
      });
  }

  triggerGlitchTransition(callback) {
      if (!this.glitchOverlay) return callback();
      
      this.glitchOverlay.style.opacity = '1';
      setTimeout(() => {
          this.showScreen('pseudo-terminal');
          callback();
          this.glitchOverlay.style.opacity = '0';
      }, this.glitchDuration);
  }
}

// ---------- Boot Checks ----------
class BootCheck { constructor(name, fn, description = '') { this.name = name; this.fn = fn; this.description = description; } }
class BootCheckRegistry {
  constructor() { this.checks = []; }
  add(check) { this.checks.push(check); }
  async run(bootupElement) {
    let allOk = true;
    for (const check of this.checks) {
      let lineElement;
      // Only perform DOM operations if the bootupElement exists
      if (bootupElement) {
        lineElement = document.createElement('div');
        lineElement.innerHTML = `- ${check.name}... `;
        bootupElement.appendChild(lineElement);
      }

      let statusText = '';
      try {
        // Always run the check function
        const passed = await check.fn();
        if (!passed) allOk = false;
        statusText = passed ? '<span class="status-ok">OK</span>' : '<span class="status-failed">FAILED</span>';
      } catch (e) {
        console.error(`Boot check "${check.name}" failed with an error:`, e);
        statusText = '<span class="status-failed">FAILED</span>';
        allOk = false;
      }

      // Only update the DOM if it exists
      if (bootupElement && lineElement) {
        lineElement.innerHTML += statusText;
      }
    }
    return allOk;
  }
}

// ---------- Addon System (New) ----------
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

// --- New Addon Implementations ---
class EditorAddon extends Addon {
    constructor() {
        super('edit');
        this.filePath = null;
        this.lines = [];
        this.isDirty = false;
    }

    onStart(args) {
        this.filePath = this.vOS.normalize(args[0] || 'untitled.txt');
        const content = this.vOS.readFile(this.filePath);

        // CORRECTED LINE:
        // If content is null (a new file), start with an empty array.
        // Otherwise, split the content. This prevents the initial blank line.
        this.lines = content === null ? [] : content.split('\n');

        this.isDirty = false;
        
        this.term.clear();
        this.term._print(`Editing "${this.filePath}".`);
        this.term._print('Enter text to add lines. Commands: :w (save), :q (quit), :wq (save & quit)');
        
        // Display existing lines if there are any
        if (this.lines.length > 0) {
            this.lines.forEach((line, i) => this.term._print(`${String(i + 1).padStart(3)}  ${line}`));
        }
    }
    
    // Override default command handling for special editor logic
    handleCommand(input) {
        if (input.startsWith(':')) {
            const cmd = input.substring(1).toLowerCase();
            switch (cmd) {
                case 'w': this.saveFile(); break;
                case 'q':
                    if (this.isDirty) this.term._print('Warning: Unsaved changes. Use :q! or :wq.');
                    else this.exit();
                    break;
                case 'q!': this.exit(); break;
                case 'wq': this.saveFile(); this.exit(); break;
                default: this.term._print(`Unknown editor command: ${cmd}`);
            }
        } else {
            this.lines.push(input);
            this.isDirty = true;
            this.term._print(`${String(this.lines.length).padStart(3)}  ${input}`);
        }
    }

    saveFile() {
        const content = this.lines.join('\n');
        if (this.vOS.writeFile(this.filePath, content, 'text', true)) {
            this.isDirty = false;
            this.term._print('File saved.');
            this.term._saveState();
        } else {
            this.term._print('Error: Could not save file.');
        }
    }

    onStop() {
        this.term.clear();
        this.term._print('Returned to main terminal.');
    }
}

class RpsAddon extends Addon {
    constructor() {
        super('rps');
        this.player = 0;
        this.cpu = 0;
        this.rounds = 0;

        // Register addon-specific commands
        this.addCommand('rock', 'Choose rock', () => this.play('rock'));
        this.addCommand('paper', 'Choose paper', () => this.play('paper'));
        this.addCommand('scissors', 'Choose scissors', () => this.play('scissors'));
        this.addCommand('score', 'View the current score', () => this.showScore());
    }

    onStart() {
        this.term.clear();
        this.term._print('--- Rock, Paper, Scissors ---');
        this.commands.help.execute(); // Show rps-specific help
        this.player = 0; this.cpu = 0; this.rounds = 0;
    }

    play(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const cpuChoice = choices[Math.floor(Math.random() * 3)];
        this.term._print(`> You: ${playerChoice} | Computer: ${cpuChoice}`);

        if (playerChoice === cpuChoice) {
            this.term._print("It's a tie!");
        } else if ((playerChoice === 'rock' && cpuChoice === 'scissors') || (playerChoice === 'paper' && cpuChoice === 'rock') || (playerChoice === 'scissors' && cpuChoice === 'paper')) {
            this.term._print('You win!'); this.player++;
        } else {
            this.term._print('Computer wins.'); this.cpu++;
        }
        this.rounds++;
        this.term._print('---');
    }

    showScore() {
        this.term._print(`-- Score: Player ${this.player} - ${this.cpu} CPU (${this.rounds} rounds) --`);
    }
    
    onStop() {
        this.term.clear();
        this.term._print('Thanks for playing!');
        this.showScore();
    }
}

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

// ---------- Terminal UI Handler ----------
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
// ---------- Central Terminal ----------
class CentralTerminal {
  constructor(containerOrUI, ...args) {
    this.version = '5.1.5';

    if (typeof containerOrUI === 'string') {
      this.ui = new TerminalUI(containerOrUI, this.runCommand.bind(this), this._autoComplete.bind(this), ...args);
    } else {
      this.ui = containerOrUI;
    }

    this.vOS = new VOS();
    this.commandHistory = [];
    this.historyIndex = -1;
    this.commands = {};
    // this.editor and this.rps are now obsolete and have been removed.
    this.addonExecutor = new AddonExecutor(this, this.vOS);
    this.bootRegistry = new BootCheckRegistry();
    this.customBootupText = null;
    this._registerDefaultCommands();
  }

  // --- Core Methods ---
  _print(text) { this.ui.appendTerminalOutput(text); }
  _biosWrite(text) { this.ui.appendTerminalOutput(text, false); }
  _biosWriteLine(text) { this.ui.appendTerminalOutput(text, true); }
  clear() { this.ui.clearTerminal(); }
  setBootupText(text) {
    this.customBootupText = text;
  }

  // --- Retro BASH-like prompt ---
  prompt() {
    if (this.addonExecutor.isActive()) {
      return `(${this.addonExecutor.activeAddon.name})> `;
    }
    const cwd = this.vOS.pathOf(this.vOS.cwd) || '/'; // <-- fallback to '/'
    return `<span class="prompt-user">user</span>@<span class="prompt-host">central</span> <span class="prompt-path">${cwd}</span>: $ `;
  }  

  _saveHistory() { localStorage.setItem('cterm_history', JSON.stringify(this.commandHistory)); }
  _saveState() { localStorage.setItem('cterm_vos', JSON.stringify(this.vOS.toJSON())); }

  // --- Addon Management ---
  registerAddon(addonInstance) { this.addonExecutor.register(addonInstance); }
  addCommand(cmd) { this.commands[cmd.name] = cmd; }

  // --- Main Command Runner (REPLACE THIS METHOD) ---
  async runCommand(rawInput) {
    const input = rawInput.trim();
    if (!input) {
        this.ui.setPrompt(this.prompt());
        return;
    }

    // Echo the command to the terminal output
    this.ui.appendTerminalOutput(`${this.prompt()}${input}`);

    // If an addon is active, pass the command to it and stop further processing.
    if (this.addonExecutor.handleCommand(input)) {
        this._saveState(); // Save state after addon command
        this.ui.setPrompt(this.prompt());
        return;
    }

    // Add to history for main terminal commands
    this.commandHistory.push(input);
    this._saveHistory();

    const parts = input.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const name = parts.shift() || '';
    const args = parts.map(p => p.replace(/^["']|["']$/g, ''));
    const cmd = this.commands[name];

    if (!cmd) {
      this._print(`bash: ${name}: command not found`);
      this.ui.setPrompt(this.prompt());
      return;
    }

    try {
      await cmd.execute(args, this);
    } catch (err) {
      this._print(`Error running command: ${err}`);
      console.error(err);
    }

    this._saveState();
    this.ui.setPrompt(this.prompt());
  }

  // --- Boot Sequence ---
  async boot() {
    const bootHandler = new BootHandler(this);

    // Add default checks
    this.bootRegistry.add(new BootCheck('Loading saved session', () => {
      try {
        const vosData = localStorage.getItem('cterm_vos');
        if (vosData) this.vOS = VOS.fromJSON(JSON.parse(vosData));
        const historyData = localStorage.getItem('cterm_history');
        if (historyData) this.commandHistory = JSON.parse(historyData);
        return true;
      } catch (e) {
        console.error("Failed to load session:", e);
        return true; // Don't block boot on corrupted save
      }
    }));
    
    this.bootRegistry.add(new BootCheck('Verifying core components', async () => {
        await new Promise(r => setTimeout(r, 150)); // fake delay
        return typeof this.vOS !== 'undefined' && typeof this.addonExecutor !== 'undefined';
    }));

    this.bootRegistry.add(new BootCheck('Checking UI elements', async () => {
        await new Promise(r => setTimeout(r, 200)); // fake delay
        return this.ui && this.ui.input && this.ui.output;
    }));

    try {
        // Run the full animated boot sequence
        await bootHandler.run();
        
        // This code runs *after* the animation is complete
        this.clear(); // Clear bootup text from the actual terminal output
        const motd = this.vOS.readFile('/etc/motd');
        if (motd) this._print(motd);
        this.ui.setPrompt(this.prompt()); // Set initial prompt
        this.ui.input.focus();

    } catch (error) {
        console.error(error); // Log boot failure
        // The error message is already on the boot screen
    }
  }

  // ---------- Default Commands (REPLACE THIS METHOD) ----------
  _registerDefaultCommands() {
    const cmd = (name, desc, exec) => ({ name, desc, execute: exec });

    // --- Addon Aliases & Runner ---
    this.addCommand(cmd('run', 'run a registered addon', (args, term) => {
        const addonName = args.shift();
        if (!addonName) {
            term._print('usage: run <addon_name> [args...]');
            return;
        }
        term.addonExecutor.start(addonName, args);
    }));
    this.addCommand(cmd('edit', 'edit a file using the text editor addon', (args, term) => {
      term.addonExecutor.start('edit', args);
    }));
    this.addCommand(cmd('vim', 'alias for the edit command', (args, term) => {
        term.addonExecutor.start('edit', args);
    }));
    this.addCommand(cmd('rps', 'play rock-paper-scissors', (args, term) => {
      term.addonExecutor.start('rps', args);
    }));
  

    // --- Filesystem (with fixes) ---
    this.addCommand(cmd('ls', 'list files', (args, term) => {
      const files = term.vOS.ls(args[0] || '.');
      if (files === null) term._print(`ls: cannot access '${args[0] || '.'}'`);
      else if (files.length > 0) term._print(files.join('  '));
    }));
    this.addCommand(cmd('cd', 'change directory', (args, term) => {
        const target = args[0] || '~';
        if (!term.vOS.chdir(target)) {
            term._print(`cd: no such file or directory: ${target}`);
        }
    }));
    this.addCommand(cmd('pwd', 'print working directory', () => this._print(this.vOS.pathOf(this.vOS.cwd))));
    
    this.addCommand(cmd('mkdir', 'make directory', args => {
      const pathArg = args.filter(a => !a.startsWith('-')).pop();
      const pFlag = args.includes('-p');
      if (!pathArg) { this._print('usage: mkdir [-p] <dir>'); return; }
      
      const success = pFlag ? this.vOS._mkdirp(pathArg) : this.vOS.mkdir(pathArg);
      if (!success) this._print(`mkdir: cannot create directory '${pathArg}'`);
    }));

    this.addCommand(cmd('rmdir', 'remove empty directory', args => {
      if (!args[0]) this._print('usage: rmdir <dir>');
      else if (!this.vOS.rmdir(args[0])) this._print(`rmdir: failed to remove '${args[0]}'`);
    }));
    this.addCommand(cmd('rm', 'remove file', args => {
      if (!args[0]) this._print('usage: rm <file>');
      else if (!this.vOS.unlink(this.vOS.normalize(args[0]))) this._print(`rm: cannot remove '${args[0]}'`);
    }));
    this.addCommand(cmd('cp', 'copy file', args => {
      const [src, dest] = args;
      if (!src || !dest) { this._print('usage: cp <src> <dest>'); return; }
      const node = this.vOS.resolve(src);
      if (!(node instanceof VFile)) { this._print(`cp: cannot copy '${src}'`); return; }
      if (!this.vOS.writeFile(dest, node.content, node.ftype, true)) this._print(`cp: cannot write to '${dest}'`);
    }));
    this.addCommand(cmd('mv', 'move/rename file', args => {
      const [src, dest] = args;
      if (!src || !dest) { this._print('usage: mv <src> <dest>'); return; }
      const node = this.vOS.resolve(src);
      if (!node) { this._print(`mv: cannot stat '${src}'`); return; }
      const success = this.vOS.writeFile(dest, node.content || '', node.ftype, true);
      if (success && node.kind === 'file') {
          this.vOS.unlink(src);
      } else if (!success) {
          this._print(`mv: cannot move to '${dest}'`);
      }
    }));
    this.addCommand(cmd('touch', 'create empty file', args => {
      if (!args[0]) this._print('usage: touch <file>');
      else this.vOS.writeFile(args[0], '', 'text', false);
    }));
    this.addCommand(cmd('cat', 'print file contents', args => {
      const content = this.vOS.readFile(args[0]);
      this._print(content === null ? `cat: ${args[0]}: No such file` : content);
    }));

    this.addCommand(cmd('head', 'first N lines of a file', args => {
        const f = args[0]; const n = parseInt(args[1] || '10', 10);
        if (!f) { this._print('usage: head <file> [lines]'); return; }
        const node = this.vOS.resolve(f);
        if (!node || !(node instanceof VFile)) { this._print(`head: cannot open '${f}'`); return; }
        this._print(node.content.split('\n').slice(0, n).join('\n'));
    }));

    this.addCommand(cmd('tail', 'last N lines of a file', args => {
        const f = args[0]; const n = parseInt(args[1] || '10', 10);
        if (!f) { this._print('usage: tail <file> [lines]'); return; }
        const node = this.vOS.resolve(f);
        if (!node || !(node instanceof VFile)) { this._print(`tail: cannot open '${f}'`); return; }
        this._print(node.content.split('\n').slice(-n).join('\n'));
    }));

    this.addCommand(cmd('tree', 'show directory tree', args => {
      const dir = this.vOS.resolve(args[0] || '.');
      if (!(dir instanceof VDirectory)) { this._print(`tree: ${args[0]}: No such directory`); return; }
      this._print(dir.name || '/');
      this._tree(dir, '');
    }));
    
    this.addCommand(cmd('grep', 'search pattern in file', args => {
      const [p, f] = args; if (!p || !f) { this._print('usage: grep <pattern> <file>'); return; }
      const node = this.vOS.resolve(f); if (!node || !(node instanceof VFile)) { this._print(`grep: ${f}: No such file`); return; }
      try {
        const re = new RegExp(p, 'g');
        const matches = node.content.split('\n').filter(l => l.match(re));
        if (matches.length > 0) this._print(matches.join('\n'));
      } catch (e) {
        this._print(`grep: invalid pattern: ${e.message}`);
      }
    }));

    // --- Mock FS Commands ---
    this.addCommand(cmd('ln', 'create symbolic link (mock)', () => this._print('ln: symbolic links not implemented')));
    this.addCommand(cmd('find', 'find files/directories (mock)', () => this._print('find: not implemented')));
    this.addCommand(cmd('chmod', 'change file permissions (mock)', () => this._print('chmod: permission change simulated')));
    this.addCommand(cmd('chown', 'change file owner (mock)', () => this._print('chown: ownership simulated')));
    this.addCommand(cmd('chgrp', 'change group (mock)', () => this._print('chgrp: group change simulated')));
    this.addCommand(cmd('umask', 'show umask', () => this._print('022')));

    // --- Process / System (Mocks) ---
    this.addCommand(cmd('ps', 'list processes (mock)', () => this._print('PID TTY TIME CMD\n1 pts/0 00:00 bash')));
    this.addCommand(cmd('top', 'process monitor (mock)', () => this._print('Top: simulated')));
    this.addCommand(cmd('kill', 'kill process (mock)', () => this._print('kill: simulated')));
    this.addCommand(cmd('pkill', 'kill by name (mock)', () => this._print('pkill: simulated')));
    this.addCommand(cmd('pgrep', 'find process by name (mock)', () => this._print('pgrep: simulated')));
    
    // --- System Info ---
    this.addCommand(cmd('uname', 'system information', () => this._print(`CentralTerminal OS v${this.version}`)));
    this.addCommand(cmd('whoami', 'current user', () => this._print('user')));
    this.addCommand(cmd('df', 'disk usage (mock)', () => this._print('/dev/vfs 1024M 512M 512M 50% /')));
    this.addCommand(cmd('du', 'directory usage (mock)', () => this._print('4K\t./docs\n8K\t./home/user')));
    this.addCommand(cmd('free', 'memory info (mock)', () => this._print('Mem: 1024MB total, 512MB used, 512MB free')));
    this.addCommand(cmd('uptime', 'system uptime (mock)', () => this._print('up 1 day, 4:20')));
    
    // --- Utilities ---
    this.addCommand(cmd('echo', 'echo arguments', args => this._print(args.join(' '))));
    this.addCommand(cmd('history', 'command history', () => this.commandHistory.forEach((h,i)=>this._print(`${String(i+1).padStart(3, ' ')}  ${h}`))));
    this.addCommand(cmd('hclear', 'clear command history', (args, term) => {
        term.commandHistory = [];
        term._saveHistory();
        term._print('Command history cleared.');
    }));
    this.addCommand(cmd('date', 'current date/time', () => this._print(new Date().toString())));
    this.addCommand(cmd('clear', 'clear terminal screen', () => this.clear()));
    this.addCommand(cmd('exit', 'exit terminal', () => this._print('Exiting terminal...')));
    this.addCommand(cmd('ping', 'ping host (mock)', args => this._print(`PING ${args[0] || 'localhost'}: 32 bytes`)));
    this.addCommand(cmd('curl', 'fetch URL (mock)', args => this._print(`curl: fetched ${args[0] || 'http://example.com'}`)));
    this.addCommand(cmd('help', 'show help', () => {
        this._print('Available commands:\n');
        const longest = Math.max(...Object.keys(this.commands).map(n => n.length));
        Object.values(this.commands)
          .sort((a,b) => a.name.localeCompare(b.name))
          .forEach(c => this._print(`${c.name.padEnd(longest)} - ${c.desc}`));
    }));

    // --- Fun / Visual (Async) ---
    this.addCommand(cmd('aafire', 'ASCII fire animation', async (args, term) => {
        term._print('Starting ASCII fire... Press Ctrl+C to stop.');
        let running = true;
        const stop = () => { running = false; };
        term.ui.registerCtrlC(stop);
        const frames = ["( ) ( )", "(   ) (   )", ") ( ) (", "(   ) (   )"];
        while(running) {
            for (const frame of frames) {
                if (!running) break;
                // We create a new div for each frame to avoid clearing the screen
                const frameDiv = document.createElement('div');
                frameDiv.textContent = frame;
                term.ui.output.appendChild(frameDiv);
                term.ui.output.scrollTop = term.ui.output.scrollHeight;
                await new Promise(r => setTimeout(r, 200));
            }
        }
        term._print('ASCII fire stopped.');
        term.ui.registerCtrlC(null); // Unregister the handler
    }));
    this.addCommand(cmd('cmatrix', 'Matrix-style falling text', async (args, term) => {
        term._print('Starting Matrix... Press Ctrl+C to stop.');
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
        let running = true;
        const stop = () => { running = false; };
        term.ui.registerCtrlC(stop); // Register handler
        while(running) {
            const line = Array.from({length: 80}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
            term._print(`<span style="color: #0f0;">${line}</span>`);
            await new Promise(r => setTimeout(r, 100));
        }
        term._print('Matrix stopped.');
        term.ui.registerCtrlC(null); // Unregister handler
    }));
  }

  // Helper for the 'tree' command
  _tree(dir, prefix) {
    const entries = Object.values(dir.children).sort((a, b) => a.name.localeCompare(b.name));
    entries.forEach((child, idx) => {
      const last = idx === entries.length - 1;
      const branch = last ? '└── ' : '├── ';
      const nextPref = prefix + (last ? '    ' : '│   ');
      this._print(prefix + branch + child.name + (child.kind === 'dir' ? '/' : ''));
      if (child instanceof VDirectory) this._tree(child, nextPref);
    });
  }


  // --- Autocomplete ---
  _autoComplete() {
    if (!this.ui || !this.ui.input) return;
    // Implementation remains the same as your version...
    const text = this.ui.input.value;
    if (!text.trim()) return;
    const parts = text.match(/(?:[^\\s\\"']+|'[^']*'|\\"[^\\"]*\\")+/g) || [];
    const last = parts[parts.length - 1] || '';
    const isPathy = last.startsWith('/') || last.startsWith('.') || last.startsWith('~');

    if (parts.length === 1 && !isPathy) {
      const all = Object.keys(this.commands);
      const matches = all.filter(n => n.startsWith(last));
      if (matches.length === 1) this.ui.input.value = matches[0] + ' ';
      else if (matches.length > 1) this._print(matches.join('  '));
      return;
    }

    const before = parts.slice(0, -1).join(' ');
    const path = last;
    let norm;
    try { norm = this.vOS.normalize(path); } catch { norm = path; }
    const dirPath = norm.endsWith('/') ? norm : (norm.lastIndexOf('/') >= 0 ? norm.slice(0, norm.lastIndexOf('/') + 1) : '/');
    const base = norm.slice(dirPath.length);
    const dir = this.vOS.resolve(dirPath || '.');
    if (!(dir instanceof VDirectory)) return;
    const ents = Object.keys(dir.children).filter(n => n.startsWith(base));
    if (ents.length === 1) {
      const comp = (dirPath === '/' && ents[0].startsWith('/') ? '' : dirPath) + ents[0];
      const node = dir.children[ents[0]];
      const suffix = node instanceof VDirectory ? '/' : ' ';
      this.ui.input.value = (before ? before + ' ' : '') + comp + suffix;
    } else if (ents.length > 1) this._print(ents.join('  '));
  }
}

export { CentralTerminal, BootCheck, BootCheckRegistry, Addon, AddonExecutor, EditorAddon, RpsAddon, VFile, VDirectory, VOS, TerminalUI };