
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

// --- Command Class ---
class Command {
    constructor(name, description, execute, aliases = []) {
        this.name = name;
        this.description = description;
        this.execute = execute;
        this.aliases = aliases;
    }
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
            term.printHtml(`<p style="color: yellow;">This addon runs in your browser. Only install trusted addons from official sources. Use at your own risk.</p>`);
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
    constructor(name, check, description = '') {
        this.name = name;
        this.check = check;
        this.description = description;
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
            terminal.biosOutput.innerHTML += `<span class="status-${result.status}">${result.message}</span>`;
            if (result.status === 'failed') allOk = false;
        }
        return allOk;
    }
}

/**
 * Represents a single boot-time check for the terminal.
 * @property {string} name - The name of the check (e.g., "Memory Check").
 * @property {function(): Promise<boolean>} check - A function that returns a promise resolving to `true` (success) or `false` (failure).
 * @property {string} description - A brief description of what the check does.
 */
export class BootCheck {
    /**
     * @param {string} name - The name of the check.
     * @param {function(): Promise<boolean>} check - The check function.
     * @param {string} description - A description of the check.
     */
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

// --- Main Terminal Class ---
export class CentralTerminal {
    constructor(containerId) {
        this.container = document.querySelector(containerId);
        if (!this.container) { console.error(`Container with id ${containerId} not found.`); return; }

        this.biosScreen = document.getElementById('bios-screen');
        this.biosOutput = document.getElementById('bios-output');
        this.pseudoTerminal = document.getElementById('pseudo-terminal');
        this.output = this.container.querySelector('#terminalOutput');
        this.input = this.container.querySelector('#terminal-command-input');
        
        this.bootCheckRegistry = new BootCheckRegistry();
        this.vOS = new VOS();
        this.addonExecutor = new AddonExecutor();
        this.commands = {};
        this.commandHistory = [];

        this._registerDefaultCommands();
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.runCommand(this.input.value);
                this.input.value = '';
            }
        });
    }

    async boot() {
        this.biosOutput.innerHTML = '';
        this.biosOutput.innerHTML += `<p>Central BIOS v1.0.0</p><p>Copyright (C) 2024, Central Corp.</p><p>&nbsp;</p>`;
        const allOk = await this.bootCheckRegistry.runChecks(this);
        this.biosOutput.innerHTML += `<p>&nbsp;</p>`;
        if (allOk) {
            this.biosOutput.innerHTML += `<p>Booting complete.</p>`;
            setTimeout(() => {
                this.biosScreen.style.display = 'none';
                this.pseudoTerminal.style.display = 'flex';
                this.print("Welcome to Central Terminal!");
                this.print("Type 'help' to see a list of available commands.");
            }, 1000);
        } else {
            this.biosOutput.innerHTML += `<p class="status-failed">Boot failed. Please check the system.</p>`;
        }
    }

    addBootCheck(bootCheck) { this.bootCheckRegistry.addCheck(new BootCheck(bootCheck.name, bootCheck.check, bootCheck.description)); }
    registerAddon(addon) { this.addonExecutor.registerAddon(addon); }
    addCommand(command) { this.commands[command.name] = command; if(command.aliases) command.aliases.forEach(alias => this.commands[alias] = command); }

    bootCheck(check) {
        return new Promise(resolve => {
            check().then(success => resolve({ status: success ? 'ok' : 'failed', message: success ? 'OK' : 'FAILED' }))
                   .catch(() => resolve({ status: 'failed', message: 'FAILED' }));
        });
    }

    _sanitizeHtml(html) {
        const allowedTags = ['p', 'b', 'i', 'u', 'em', 'strong', 'pre', 'code', 'span', 'div', 'img', 'audio'];
        const allowedAttrs = ['style', 'src', 'alt', 'controls'];

        const el = document.createElement('div');
        el.innerHTML = html;

        el.querySelectorAll('*').forEach(node => {
            // Remove disallowed tags
            if (!allowedTags.includes(node.tagName.toLowerCase())) {
                node.parentNode.removeChild(node);
                return;
            }

            // Remove disallowed attributes
            for (const attr of [...node.attributes]) {
                if (!allowedAttrs.includes(attr.name.toLowerCase())) {
                    node.removeAttribute(attr.name);
                }
            }
        });

        return el.innerHTML;
    }

    print(text) { const p = document.createElement('p'); p.textContent = text; this.output.appendChild(p); this.output.scrollTop = this.output.scrollHeight; }
    printHtml(html) { const div = document.createElement('div'); div.innerHTML = this._sanitizeHtml(html); this.output.appendChild(div); this.output.scrollTop = this.output.scrollHeight; }
    clear() { this.output.innerHTML = ''; }

    _registerDefaultCommands() {
        this.addCommand(new Command("pwd", "Print current working directory", () => this.print(this.vOS._getFullPath(this.vOS.cwd))));
        this.addCommand(new Command("ls", "List files in current directory", (args) => {
            const path = args[0] || '.';
            const files = this.vOS.listFiles(path);
            this.print(files.length > 0 ? files.join('\n') : "Empty directory.");
        }));
        this.addCommand(new Command("cd", "Change directory", (args) => {
            if (!args[0] || !this.vOS.changeDir(args[0])) this.print(`cd: no such file or directory: ${args[0] || ''}`);
        }));
        this.addCommand(new Command("cat", "Display file contents", (args) => {
            const file = this.vOS._resolvePath(args[0] || '');
            if (!file || !(file instanceof VFile)) { this.print(`cat: No such file: ${args[0]}`); return; }
            switch (file.type) {
                case 'text': file.content.split('\n').forEach(line => this.print(line)); break;
                case 'image': this.printHtml(`<img src="${file.content}" alt="${file.name}" style="max-width: 100%; height: auto;">`); break;
                case 'audio': this.printHtml(`<audio controls src="${file.content}">Your browser does not support audio playback.</audio>`); break;
                case 'exe': this.print(`[Executable] To run this, type: run ${file.name}`); break;
                default: this.print(`Unsupported file type: ${file.type}`);
            }
        }));
        this.addCommand(new Command("mkdir", "Create a directory", (args) => {
            if (!args[0] || !this.vOS.createDirectory(args[0])) this.print(`mkdir: cannot create directory: ${args[0] || ''}`);
        }));
        this.addCommand(new Command("touch", "Create an empty file", (args) => {
             if (!args[0]) { this.print("Usage: touch <filename>"); return; }
             if (!this.vOS.createFile(args[0])) this.print(`touch: cannot create file: ${args[0]}`);
        }));
        this.addCommand(new Command("rm", "Delete a file", (args) => {
            if (!args[0]) { this.print("Usage: rm <filename>"); return; }
            if (!this.vOS.deleteFile(args[0])) this.print(`rm: cannot remove '${args[0]}': No such file or directory`);
        }));
        this.addCommand(new Command("echo", "Print text", (args) => this.print(args.join(" "))));
        this.addCommand(new Command("history", "Show command history. Use !<number> to rerun.", () => {
            this.commandHistory.forEach((cmd, index) => this.print(`${index + 1}: ${cmd}`));
        }));
        this.addCommand(new Command("date", "Displays the current date and time.", () => this.print(new Date().toLocaleString()), ["time"]));
        this.addCommand(new Command("tree", "Display the directory structure as a tree.", (args) => {
            const path = args[0] || '.';
            const startNode = this.vOS._resolvePath(path);
            if (startNode instanceof VDirectory) {
                this.print(this.vOS._getFullPath(startNode));
                this._printTreeRecursive(startNode);
            } else {
                this.print(`tree: '${path}' is not a directory.`);
            }
        }));
        this.addCommand(new Command("clear", "Clear terminal output", () => this.clear()));
        this.addCommand(new Command("help", "List available commands", () => {
            const helpText = [...new Set(Object.values(this.commands))].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`${c.name.padEnd(15)}- ${c.description}`).join('\n');
            this.printHtml(`<pre>${helpText}</pre>`);
        }));
        this.addCommand(new Command("run", "Run a registered addon", (args) => {
            if (!args[0]) { this.print("Usage: run <addon-name> [args]"); return; }
            this.addonExecutor.startAddon(args[0], this, this.vOS, ...args.slice(1));
        }));
        this.addCommand(new Command("exit", "Exits the current addon.", () => {
            if (!this.addonExecutor.activeAddon) { this.print("No active addon to exit."); return; }
            this.addonExecutor.stopAddon(this);
        }));
    }

    runCommand(input) {
        input = input.trim();
        if (!input) return;

        this.print(`> ${input}`);
        if (this.commandHistory[this.commandHistory.length - 1] !== input) {
            this.commandHistory.push(input);
        }

        if (input.startsWith('!')) {
            const idx = parseInt(input.substring(1), 10) - 1;
            const cmd = this.commandHistory[idx];
            if (cmd) { this.runCommand(cmd); } 
            else { this.print("Invalid history index."); }
            return;
        }

        if (this.addonExecutor.activeAddon) {
            this.addonExecutor.handleCommand(input);
            return;
        }

        const parts = input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const cmdName = parts.shift()?.replace(/"/g, '').toLowerCase();
        if (!cmdName) return;
        
        const args = parts.map(arg => arg.replace(/"/g, ''));
        const command = this.commands[cmdName];

        if (command) {
            command.execute(args);
        } else {
            this.print(`Command not recognized: ${cmdName}.`);
        }
    }

    _printTreeRecursive(directory, prefix = '') {
        const children = Object.values(directory.children);
        children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            const decorator = isLast ? '└── ' : '├── ';
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            if (child instanceof VDirectory) {
                this.print(`${prefix}${decorator}${child.name}/`);
                this._printTreeRecursive(child, newPrefix);
            } else {
                this.print(`${prefix}${decorator}${child.name}${child.type === 'exe' ? '*' : ''}`);
            }
        });
    }
}

// Export Addon class for developers
export { Addon, Command };
