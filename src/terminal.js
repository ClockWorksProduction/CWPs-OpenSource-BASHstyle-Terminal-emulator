
// ==========================
// CWP_OpenTerminalEmmulator_CORE.js
// v5.0.0 - A Modular, BASH-style Terminal Emulator Library for the Web.
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
        this.createFile('/etc/motd', 'Welcome to the Central Terminal!\n\nHave a great day!');
        this.createFile('/home/user/README.txt', 'This is a README file.');

        // Create some demonstration files and directories
        const demoContent = `
## Welcome to the Virtual File System!

This is a simple demonstration of the file system capabilities of the Central Terminal.

You can use the following commands to navigate:

- \`ls\` - List files and directories\n- \`cd\` - Change directory\n- \`cat\` - View file content\n- \`tree\` - Show the directory structure\n
Enjoy exploring!
`;

        this.createDirectory('/docs');
        this.createFile('/docs/guide.txt', demoContent);
        this.createDirectory('/media');
        this.createDirectory('/media/images');
        this.createDirectory('/media/audio');
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

    deleteDirectory(path) {
        const dir = this._resolvePath(path);
        if (dir instanceof VDirectory && Object.keys(dir.children).length === 0) {
            const parent = this._getParent(dir);
            if (parent) {
                delete parent.children[dir.name];
                return true;
            }
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
            terminal.biosOutput.innerHTML += `<span class=\"status-${result.status}\">${result.message}</span>`;
            if (result.status === 'failed') allOk = false;
        }
        return allOk;
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

        this.addonRegistry = {
            'cowsay': 'https://raw.githubusercontent.com/piotrstakh/cowsay/master/cowsay.js',
            'sl': 'https://raw.githubusercontent.com/mtoyoda/sl/master/sl.js',
        };
        this.downloadPath = '/home/user/addons';

        this.editor = {
            isActive: false,
            lines: [],
            filePath: null,
            isDirty: false,
        };

        this.rps = {
            isActive: false,
            playerScore: 0,
            computerScore: 0,
            gamesPlayed: 0,
        };

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
        this.biosOutput.innerHTML += `<p>CWP Open Terminal Emulator</p><p>Copyright (C) 2025 ClockWorks Production</p><p>&nbsp;</p>`;
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
            this.biosOutput.innerHTML += `<p class=\"status-failed\">Boot failed. Please check the system.</p>`;
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
                case 'image': this.printHtml(`<img src=\"..${file.content}\" alt=\"${file.name}\" style=\"max-width: 100%; height: auto;\">`); break;
                case 'audio': this.printHtml(`<audio controls src=\"${file.content}\">Your browser does not support audio playback.</audio>`); break;
                case 'exe': this.print(`[Executable] To run this, type: run ${file.name}`); break;
                default: this.print(`Unsupported file type: ${file.type}`);
            }
        }));
        this.addCommand(new Command("mkdir", "Create a directory", (args) => {
            if (!args[0] || !this.vOS.createDirectory(args[0])) this.print(`mkdir: cannot create directory: ${args[0] || ''}`);
        }));
        this.addCommand(new Command("rmdir", "Remove an empty directory", (args) => {
            if (!args[0] || !this.vOS.deleteDirectory(args[0])) this.print(`rmdir: failed to remove '${args[0]}': No such file or directory, or directory not empty`);
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
        this.addCommand(new Command("clear", "Clear terminal output", () => this.clear()));
        this.addCommand(new Command("run", "Run a registered addon", (args) => {
            if (!args[0]) { this.print("Usage: run <addon-name> [args]"); return; }
            this.addonExecutor.startAddon(args[0], this, this.vOS, ...args.slice(1));
        }));
        this.addCommand(new Command("exit", "Exits the current addon.", () => {
            if(this.rps.isActive) {
                this._stopRps();
            } else if (this.editor.isActive) {
                this._stopEditor();
            }
        }));
        this.addCommand(new Command('ping', 'Check network connectivity to a host.', async (args) => {
            const host = args[0];
            if (!host) {
                this.print('Usage: ping <host>');
                return;
            }
    
            this.print(`Pinging ${host}...`);
            const startTime = performance.now();
    
            try {
                await fetch(`https://${host}`, { mode: 'no-cors' });
                const duration = (performance.now() - startTime).toFixed(2);
                this.print(`Pong! Response from ${host} in ${duration}ms`);
            } catch (error) {
                this.print(`Ping failed: Could not resolve host ${host}`);
            }
        }));
        this.addCommand(new Command('curl', 'Fetch content from a URL.', async (args) => {
            const url = args[0];
            if (!url) {
                this.print('Usage: curl <url>');
                return;
            }
    
            this.print(`Fetching from ${url}...\n`);
            try {
                const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
                const response = await fetch(proxyUrl);
    
                if (!response.ok) {
                    throw new Error(`Request failed with status: ${response.status}`);
                }
    
                const text = await response.text();
                this.print(text);
            } catch (error) {
                this.print(`Error: ${error.message}`);
            }
        }));
        this.addCommand(new Command('edit', 'Edit a file using a simple vi-like editor.', (args) => {
            const path = args[0];
            if (!path) {
                this.print('Usage: edit <filename>');
                return;
            }
            this._startEditor(path);
        }));
        this.addCommand(new Command('rps', 'Play Rock, Paper, Scissors.', () => {
            this._startRps();
        }));
        this.addCommand(new Command('tree', 'Display the file system tree.', (args) => {
            const path = args[0] || '.';
            const dir = this.vOS._resolvePath(path);
            if (dir instanceof VDirectory) {
                this.print(path);
                this._printTree(dir);
            } else {
                this.print(`tree: '${path}': No such directory`);
            }
        }));
        this.addCommand(new Command('top', 'Display system processes (simulated).', () => {
            this.print('PID   USER     PR  NI  VIRT   RES   SHR   S  %CPU %MEM     TIME+  COMMAND');
            this.print('1     root     20   0  12.1g  1.2g  1.1g   R  12.5  0.8   1:05.35  systemd');
            this.print('2     user     20   0  1.4g   1.1g  1.0g   S   6.2  0.7   0:33.12  Xorg');
            this.print('3     user     20   0  2.2g   512m  256m   S   3.1  0.4   0:12.45  gnome-shell');
            this.print('4     user     20   0  8.3g   256m  128m   S   1.5  0.2   0:05.18  node');
            this.print('...');
        }));
        this.addCommand(new Command("help", "List available commands", () => {
            const helpText = [...new Set(Object.values(this.commands))].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`${c.name.padEnd(15)}- ${c.description}`).join('\n');
            this.printHtml(`<pre>${helpText}</pre>`);
        }));
    }

    _printTree(directory, prefix = '') {
        const children = Object.values(directory.children);
        children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            this.print(prefix + (isLast ? '└── ' : '├── ') + child.name);
            if (child instanceof VDirectory) {
                this._printTree(child, newPrefix);
            }
        });
    }

    _startEditor(path) {
        this.editor.isActive = true;
        this.editor.filePath = path;
        const fileNode = this.vOS._resolvePath(path);
        this.editor.lines = fileNode && fileNode.content ? fileNode.content.split('\n') : [];
        this.editor.isDirty = false;
        this.clear();
        this.print(`Editing "${path}". Type text and press Enter to add a line.`);
        this.print('Use ":w" to save, ":q" to quit, ":q!" to force quit.');
        this.print('---');
        this.editor.lines.forEach(line => this.print(line));
    }

    _handleEditorCommand(input) {
        if (input.startsWith(':')) {
            const command = input.substring(1);
            switch (command) {
                case 'w':
                    this._saveFile();
                    break;
                case 'q':
                    if (this.editor.isDirty) {
                        this.print('You have unsaved changes. Use ":q!" to discard or ":w" to save.');
                    } else {
                        this._stopEditor();
                    }
                    break;
                case 'q!':
                    this._stopEditor();
                    break;
                default:
                    this.print(`Unknown editor command: ${command}`);
                    break;
            }
        } else {
            this.editor.lines.push(input);
            this.editor.isDirty = true;
            this.print(input);
        }
    }

    _saveFile() {
        const newContent = this.editor.lines.join('\n');
        const fileNode = this.vOS._resolvePath(this.editor.filePath);
        if (fileNode) {
            fileNode.content = newContent;
        } else {
            if (!this.vOS.createFile(this.editor.filePath, newContent)) {
                this.print(`Error: Could not create file at ${this.editor.filePath}`);
                return;
            }
        }
        this.editor.isDirty = false;
        this.print('File saved.');
    }

    _stopEditor() {
        this.editor.isActive = false;
        this.editor.lines = [];
        this.editor.filePath = null;
        this.editor.isDirty = false;
        this.clear();
        this.print("Returned to main terminal.");
    }

    _startRps() {
        this.rps.isActive = true;
        this.rps.playerScore = 0;
        this.rps.computerScore = 0;
        this.rps.gamesPlayed = 0;
        this.clear();
        this.print('--- Rock, Paper, Scissors ---');
        this.print('Type your choice: \'rock\', \'paper\', or \'scissors\'.');
        this.print('Use \'score\' to see the score, or \'exit\' to quit.');
        this.print('------------------------------');
    }

    _handleRpsCommand(input) {
        const playerChoice = input.trim().toLowerCase();

        if (playerChoice === 'exit') {
            this._stopRps();
            return;
        }

        if (playerChoice === 'score') {
            this._printRpsScore();
            return;
        }

        if (!['rock', 'paper', 'scissors'].includes(playerChoice)) {
            this.print(`Invalid choice. Please choose rock, paper, or scissors.`);
            return;
        }

        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];

        this.print(`> You: ${playerChoice} | Computer: ${computerChoice}`);

        if (playerChoice === computerChoice) {
            this.print("It's a tie!");
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            this.print("You win this round!");
            this.rps.playerScore++;
        } else {
            this.print("Computer wins this round.");
            this.rps.computerScore++;
        }
        this.rps.gamesPlayed++;
        this.print('---');
    }

    _printRpsScore() {
        this.print('-- Score --');
        this.print(`Player: ${this.rps.playerScore}`);
        this.print(`Computer: ${this.rps.computerScore}`);
        this.print(`Rounds Played: ${this.rps.gamesPlayed}`);
        this.print('-----------');
    }

    _stopRps() {
        this.rps.isActive = false;
        this.clear();
        this.print('Thanks for playing Rock, Paper, Scissors!');
        this._printRpsScore();
    }

    _ensureAddonDir() {
        if (!this.vOS._resolvePath(this.downloadPath)) {
            this.vOS.createDirectory(this.downloadPath);
        }
    }

    async _installPackage(pkgName) {
        if (!pkgName) {
            this.print('Usage: tpkg install <package_name>');
            return;
        }

        const url = this.addonRegistry[pkgName];
        if (!url) {
            this.print(`Package not found in registry: ${pkgName}`);
            return;
        }

        this.print(`Downloading ${pkgName} from ${url}...`);
        try {
            const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            const code = await response.text();
            const filePath = `${this.downloadPath}/${pkgName}.js`;

            if (this.vOS._resolvePath(filePath)) {
                this.vOS.deleteFile(filePath);
            }
            this.vOS.createFile(filePath, code);

            this.print(`Successfully downloaded to ${filePath}.`);
            this.print('NOTE: Dynamic installation is not supported. This is a simulation.');
            this.print(`You can view the code with: cat ${filePath}`);

        } catch (error) {
            this.print(`Failed to install ${pkgName}: ${error.message}`);
        }
    }

    _removePackage(pkgName) {
        if (!pkgName) {
            this.print('Usage: tpkg remove <package_name>');
            return;
        }

        const filePath = `${this.downloadPath}/${pkgName}.js`;
        if (this.vOS.deleteFile(filePath)) {
            this.print(`Removed ${pkgName}.`);
        } else {
            this.print(`Package not installed: ${pkgName}`);
        }
    }

    _listPackages() {
        this.print('Available in registry:');
        this.print(Object.keys(this.addonRegistry).map(name => `- ${name}`).join('\n'));

        this.print('\nDownloaded packages:');
        const downloaded = this.vOS.listFiles(this.downloadPath);
        if (downloaded.length > 0) {
            this.print(downloaded.map(name => `- ${name.replace('.js', '')}`).join('\n'));
        } else {
            this.print('None.');
        }
    }

    runCommand(input) {
        input = input.trim();
        if (!input) return;

        this.print(`> ${input}`);
        if (this.commandHistory[this.commandHistory.length - 1] !== input) {
            this.commandHistory.push(input);
        }

        if (this.editor.isActive) {
            this._handleEditorCommand(input);
            return;
        }

        if (this.rps.isActive) {
            this._handleRpsCommand(input);
            return;
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

        const parts = input.match(/(?:[^\s\"]+|"[^\"]*")+/g) || [];
        const cmdName = parts.shift()?.replace(/\"/g, '').toLowerCase();
        if (!cmdName) return;
        
        const args = parts.map(arg => arg.replace(/\"/g, ''));
        const command = this.commands[cmdName];

        if (command) {
            command.execute(args, this);
        } else {
            this.print(`Command not recognized: ${cmdName}.`);
        }
    }

}

export { Command };
