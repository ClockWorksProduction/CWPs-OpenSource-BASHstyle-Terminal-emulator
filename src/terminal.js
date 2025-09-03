// ==========================
// CWP_OpenTerminalEmmulator_CORE.js
// v4.1.0 - A Modular, BASH-style Terminal Emulator Library for the Web.
// ==========================

// --- VFile and VDirectory Classes ---
class VFile {
    constructor(name, content = '', type = 'text') {
        this.name = name;
        this.content = content;
        this.type = type;
    }
}

class VDirectory {
    constructor(name) {
        this.name = name;
        this.children = {};
    }
    getChild(name) { return this.children[name]; }
}

// --- Addon Handling ---
class Addon {
    constructor(name) { this.name=name; this.term=null; this.vOS=null; }
    onStart(term, vOS, ...args) { this.term=term; this.vOS=vOS; this.args = args;}
    onCommand(input) { this.term.print(`[${this.name}]> ${input}`); }
    onStop() { }
}

class AddonExecutor {
    constructor() { this.addons={}; this.activeAddon=null; }
    registerAddon(addon) { this.addons[addon.name.toLowerCase()] = addon; }
    startAddon(name, term, vOS, ...args) {
        if (this.activeAddon) { term.print("An addon is already running. Please 'exit' first."); return; }
        const addon = this.addons[name.toLowerCase()];
        if (addon) {
            term.printHtml(`<p style=\"color: yellow;\">This addon runs in your browser. Only install trusted addons from official sources. Use at your own risk.</p>`);
            this.activeAddon = addon;
            addon.onStart(term, vOS, ...args);
        } else {
            term.print(`Addon not found: ${name}`);
        }
    }
    stopAddon(term) {
        if (this.activeAddon) {
            this.activeAddon.onStop();
            this.activeAddon = null;
            if (term) term.print("Returned to main terminal.");
        }
    }
    handleCommand(input) { if (this.activeAddon) this.activeAddon.onCommand(input); }
}

// --- VirtualOS Class ---
class VOS {
    constructor() {
        this.root = new VDirectory('/');
        this.cwd = this.root;
        this._initializeFileSystem();
    }

    _initializeFileSystem() {
        this.createDirectory('/home');
        this.createDirectory('/home/user');
        this.createDirectory('/bin');
        this.createDirectory('/etc');
        this.createFile('/etc/motd', 'Welcome to the Central Terminal!');
        this.createFile('/home/user/README.txt', 'This is a README file.');
    }

    _resolvePath(path) {
        if (path === '/') return this.root;
        let parts = path.split('/').filter(p => p.length > 0);
        let current = path.startsWith('/') ? this.root : this.cwd;
        for (let part of parts) {
            if (part === '..') current = this._getParent(current) || current;
            else if (part !== '.') {
                if (current instanceof VDirectory && current.getChild(part)) current = current.getChild(part);
                else return null;
            }
        }
        return current;
    }

    _getParent(node) {
        if (node === this.root) return null;
        const findParent = (dir, target) => {
            for (const child of Object.values(dir.children)) {
                if (child === target) return dir;
                if (child instanceof VDirectory) {
                    const found = findParent(child, target);
                    if (found) return found;
                }
            }
            return null;
        }
        return findParent(this.root, node);
    }

    _getFullPath(directory) {
        if (directory === this.root) return '/';
        let path = '';
        let current = directory;
        while (current && current !== this.root) {
            path = '/' + current.name + path;
            current = this._getParent(current);
        }
        return '/C/Users/user' + (path || '/');
    }

    createFile(path, content = '', type = 'text') {
        const parts = path.split('/');
        const filename = parts.pop();
        const dirPath = parts.join('/');
        const directory = this._resolvePath(dirPath);
        if (directory instanceof VDirectory && !directory.children[filename]) {
            directory.children[filename] = new VFile(filename, content, type);
            return true;
        }
        return false;
    }
    
    deleteFile(path) {
        const parts = path.split('/');
        const filename = parts.pop();
        const dirPath = parts.join('/');
        const directory = this._resolvePath(dirPath);
        if (directory instanceof VDirectory && directory.getChild(filename) instanceof VFile) {
            delete directory.children[filename];
            return true;
        }
        return false;
    }

    createDirectory(path) {
        const parts = path.split('/');
        const dirname = parts.pop() || path;
        const parentPath = parts.join('/');
        const parentDir = this._resolvePath(parentPath);
        if (parentDir instanceof VDirectory && !parentDir.children[dirname]) {
            parentDir.children[dirname] = new VDirectory(dirname);
            return true;
        }
        return false;
    }

    listFiles(path = '.') {
        const directory = this._resolvePath(path);
        if (directory instanceof VDirectory) {
            return Object.keys(directory.children).map(key => {
                const child = directory.children[key];
                if (child instanceof VDirectory) return `${key}/`;
                if (child.type === 'exe') return `${key}*`;
                return key;
            });
        }
        return [];
    }

    changeDir(path) {
        const newDir = this._resolvePath(path);
        if (newDir instanceof VDirectory) {
            this.cwd = newDir;
            return true;
        }
        return false;
    }
}

// --- BootCheck ---
class BootCheck {
    constructor(name, check, description) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('BootCheck name must be a non-empty string.');
        }
        if (typeof check !== 'function') {
            throw new Error('BootCheck check must be a function that returns a Promise.');
        }
        this.name = name;
        this.check = check;
        this.description = description || '';
    }
}
class BootCheckRegistry {
    constructor() { this.checks = []; }
    addCheck(bootCheck) { this.checks.push(bootCheck); }
    async runChecks(terminal) {
        let allOk = true;
        for (const check of this.checks) {
            terminal.biosOutput.innerHTML += `<p>Running: ${check.name}... </p>`;
            const result = await terminal.bootCheck(check.check);
            terminal.biosOutput.innerHTML += `<span class=\"status-${result.status}\">${result.message}</span>`;
            if (result.status === 'failed') allOk = false;
        }
        return allOk;
    }
}

// --- Main Terminal Class ---
class CentralTerminal {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.output = this.container.querySelector('#terminalOutput') || document.getElementById('terminalOutput');
    this.input = this.container.querySelector('#terminal-command-input') || document.getElementById('terminal-command-input');
    this.biosOutput = document.getElementById('bios-output');
    this.commands = {};
    this.bootChecks = [];
    this.bootCheckRegistry = new BootCheckRegistry();
    this.addons = {};
    this.activeAddon = null;
    // Match test expectations: start in /user
    this.cwd = '/user';
    this.fs = { '/user': {} };
    this.initDefaultCommands();
  }

  initDefaultCommands() {
    this.addCommand(new Command('pwd', 'Print working directory', (args) => this.print(this.cwd)));
    this.addCommand(new Command('ls', 'List files', (args) => {
      const files = Object.keys(this.fs[this.cwd] || {});
      this.print(files.length ? files.join('\n') : '');
    }));
    this.addCommand(new Command('cd', 'Change directory', (args) => {
      const path = args[0];
      if (path && this.fs[path]) {
        this.cwd = path;
      } else if (path && path.startsWith('/')) {
        this.fs[path] = this.fs[path] || {};
        this.cwd = path;
      } else {
        this.print('Directory not found.');
        return;
      }
    }));
    this.addCommand(new Command('cat', 'Show file contents', (args) => {
      const file = args[0];
      if (file && this.fs[this.cwd][file] !== undefined) {
        this.print(this.fs[this.cwd][file]);
      } else {
        this.print('File not found.');
      }
    }));
    this.addCommand(new Command('touch', 'Create file', (args) => {
      const file = args[0];
      if (file) {
        this.fs[this.cwd][file] = '';
      }
    }));
    this.addCommand(new Command('help', 'Show help', (args) => {
      this.print(Object.keys(this.commands).join(', '));
    }));
    this.addCommand(new Command('run', 'Run addon', (args) => {
      const addonName = args[0];
      if (addonName && this.addons[addonName]) {
        this.activeAddon = this.addons[addonName];
        this.activeAddon.onStart(this);
      } else {
        this.print('Addon not found.');
      }
    }));
    this.addCommand(new Command('exit', 'Exit addon', (args) => {
      if (this.activeAddon) {
        this.activeAddon.onStop();
        this.activeAddon = null;
        this.print('Returned to main terminal.');
      }
    }));
  }

  addCommand(cmd) {
    // Support both Command(action) and Command({action})
    if (typeof cmd.action !== 'function' && cmd.execute && typeof cmd.execute === 'function') {
      cmd.action = cmd.execute;
    }
    this.commands[cmd.name] = cmd;
  }

  print(text) {
    if (this.output) {
      this.output.textContent += (text + '\n');
    }
  }

  clear() {
    if (this.output) {
      this.output.textContent = '';
    }
  }

  runCommand(input) {
    if (this.activeAddon) {
      if (input === 'exit') {
        this.activeAddon.onStop();
        this.activeAddon = null;
        this.print('Returned to main terminal.');
        return;
      }
      this.activeAddon.onCommand(input);
      return;
    }
    const [cmd, ...args] = input.split(' ');
    if (this.commands[cmd]) {
      this.commands[cmd].action(args);
    } else {
      this.print(`Command not recognized: ${cmd}.`);
    }
  }

  addBootCheck(check) {
    this.bootChecks.push(check);
  }

    async bootCheck(checkFunction) {
        try {
            const result = await checkFunction();
            return { status: result ? 'ok' : 'failed', message: result ? 'OK' : 'FAIL' };
        } catch (error) {
            return { status: 'failed', message: `FAIL: ${error.message}` };
        }
    }

  async boot() {
    if (this.biosOutput) this.biosOutput.innerHTML = 'Booting...<br>';
    for (const check of this.bootChecks) {
        const result = await this.bootCheck(check.check);
        if (this.biosOutput) this.biosOutput.innerHTML += `${check.name}: ${result.message}<br>`;
    }
    if (this.biosOutput) this.biosOutput.innerHTML += 'Booting complete.<br>';
  }

  registerAddon(addon) {
    this.addons[addon.name] = addon;
  }
}

// --- Command Class (single, exported) ---
class Command {
    constructor(name, description, execute, aliases = []) {
        this.name = name;
        this.description = description;
        this.execute = execute;
        this.aliases = aliases;
        // Fix: support both function and { action: fn } object
        if (typeof execute === 'function') {
            this.action = execute;
        } else if (execute && typeof execute.action === 'function') {
            this.action = execute.action;
        } else {
            this.action = () => {};
        }
    }
}

// Export all class for developers
module.exports = {
    CentralTerminal,
    Command,
    Addon,
    AddonExecutor,
    VFile,
    VDirectory,
    VOS,
    BootCheck,
    BootCheckRegistry
};