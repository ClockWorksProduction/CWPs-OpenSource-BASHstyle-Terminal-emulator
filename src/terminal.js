// ==========================
// CWP_OpenTerminalEmmulator_CORE.js
// v4.1.0 - A Modular, BASH-style Terminal Emulator Library for the Web.
// ==========================

class VFile {
    constructor(name, content = '') {
        this.name = name;
        this.content = content;
    }
}

class VDirectory {
    constructor(name) {
        this.name = name;
        this.children = {};
    }
    getChild(name) { return this.children[name]; }
}

class VOS {
    constructor() {
        this.root = new VDirectory('/');
        this.cwd = this.root;
        this.createDirectory('/user');
        this.cwd = this.root.getChild('user');
    }

    _resolvePath(path) {
        let current = path.startsWith('/') ? this.root : this.cwd;
        const parts = path.split('/').filter(p => p);

        for (const part of parts) {
            if (part === '..') {
                current = this._getParent(current) || current;
            } else if (part !== '.') {
                if (current instanceof VDirectory && current.getChild(part)) {
                    current = current.getChild(part);
                } else {
                    return null; // Path not found
                }
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

    getFullPath(directory) {
        if (directory === this.root) return '/';
        let path = '';
        let current = directory;
        while (current && current !== this.root) {
            path = '/' + current.name + path;
            current = this._getParent(current);
        }
        return path || '/';
    }

    createFile(path, content = '') {
        const parts = path.split('/');
        const filename = parts.pop();
        const dirPath = parts.join('/') || '/';
        const directory = this._resolvePath(dirPath);
        if (directory instanceof VDirectory && !directory.children[filename]) {
            directory.children[filename] = new VFile(filename, content);
            return true;
        }
        return false;
    }

    createDirectory(path) {
        const parts = path.split('/');
        const dirname = parts.pop();
        const parentPath = parts.join('/') || '/';
        const parentDir = this._resolvePath(parentPath);
        if (parentDir instanceof VDirectory && !parentDir.children[dirname]) {
            parentDir.children[dirname] = new VDirectory(dirname);
            return true;
        }
        return false;
    }
}

export class Command {
    constructor(name, description, execute) {
        this.name = name;
        this.description = description;
        this.execute = execute;
    }
}

export class CentralTerminal {
    constructor(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) throw new Error(`Container element not found: ${containerSelector}`);

        this.output = container.querySelector('#terminalOutput');
        this.input = container.querySelector('#terminal-command-input');
        this.biosOutput = document.getElementById('bios-output'); // Assumes global ID

        this.commands = {};
        this.history = [];
        this.vfs = new VOS();

        this.initDefaultCommands();

        this.input.addEventListener('keydown', (e) => this.handleInput(e));
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const value = this.input.value.trim();
            if (value) {
                this.print(`S> ${value}`);
                this.history.push(value);
                this.runCommand(value);
            }
            this.input.value = '';
            this.output.scrollTop = this.output.scrollHeight;
        }
    }

    initDefaultCommands() {
        this.addCommand(new Command('help', 'Show available commands', () => {
            const commandList = Object.keys(this.commands).join(', ');
            this.print(commandList);
        }));

        this.addCommand(new Command('clear', 'Clear the terminal screen', () => {
            this.output.innerHTML = '';
        }));

        this.addCommand(new Command('history', 'Show command history', () => {
            this.history.forEach((cmd, i) => this.print(`${i}: ${cmd}`));
        }));
        
        this.addCommand(new Command('echo', 'Display a line of text', (args) => {
            this.print(args.join(' '));
        }));
        
        this.addCommand(new Command('pwd', 'Print name of current/working directory', () => {
            this.print(this.vfs.getFullPath(this.vfs.cwd));
        }));

        this.addCommand(new Command('ls', 'List directory contents', (args) => {
            const path = args[0] || '.';
            const node = this.vfs._resolvePath(path);
            if (node instanceof VDirectory) {
                const content = Object.keys(node.children).map(name => {
                    return node.children[name] instanceof VDirectory ? `${name}/` : name;
                }).join('\n') || '';
                this.print(content);
            } else {
                this.print(`ls: cannot access '${path}': No such file or directory`);
            }
        }));

        this.addCommand(new Command('cd', 'Change the working directory', (args) => {
            const path = args[0] || '/';
            const newDir = this.vfs._resolvePath(path);
            if (newDir instanceof VDirectory) {
                this.vfs.cwd = newDir;
            } else {
                this.print(`cd: no such file or directory: ${path}`);
            }
        }));

        this.addCommand(new Command('mkdir', 'Make directories', (args) => {
            if (!args[0]) return this.print('mkdir: missing operand');
            this.vfs.createDirectory(`${this.vfs.getFullPath(this.vfs.cwd)}/${args[0]}`);
        }));

        this.addCommand(new Command('touch', 'Create a new empty file', (args) => {
            if (!args[0]) return this.print('touch: missing operand');
            this.vfs.createFile(`${this.vfs.getFullPath(this.vfs.cwd)}/${args[0]}`);
        }));

        this.addCommand(new Command('cat', 'Concatenate and print files', (args) => {
            const path = args[0];
            if (!path) return;
            const file = this.vfs._resolvePath(path);
            if (file instanceof VFile) {
                this.print(file.content);
            } else {
                this.print(`cat: ${path}: No such file or directory`);
            }
        }));
    }

    addCommand(command) {
        this.commands[command.name] = command;
    }

    print(htmlContent) {
        this.output.innerHTML += `${htmlContent}<br>`;
        this.output.scrollTop = this.output.scrollHeight;
    }

    runCommand(line) {
        const [name, ...args] = line.trim().split(/\s+/);
        if (this.commands[name]) {
            this.commands[name].execute(args);
        } else {
            this.print(`Command not found: ${name}`);
        }
    }

    boot() {
        this.biosOutput.innerHTML = 'Booting...<br>';
        // Simulate boot checks
        setTimeout(() => {
            this.biosOutput.innerHTML += 'System Integrity Check: OK<br>';
            this.biosOutput.innerHTML += 'Booting complete.<br>';
            this.print('Welcome to the CWP Terminal Emulator!');
            this.print("Type 'help' to see a list of available commands.<br>");
        }, 500);
    }
}
