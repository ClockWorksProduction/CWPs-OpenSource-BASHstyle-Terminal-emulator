import { Command } from './command.js';
import { VFile, VDirectory } from './filesystem.js';
import { AddonExecutor } from './addon.js';
import { VOS } from './vos.js';

export class CentralTerminal {
    constructor(containerId) {
        const container = document.querySelector(containerId);
        if (!container) {
            console.error(`Container with id ${containerId} not found.`);
            return;
        }

        this.container = container;
        this.output = container.querySelector('#terminalOutput');
        this.input = container.querySelector('#terminal-command-input');

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

    print(text) {
        const p = document.createElement('p');
        p.textContent = text;
        this.output.appendChild(p);
        this.output.scrollTop = this.output.scrollHeight;
    }

    printHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        this.output.appendChild(div);
        this.output.scrollTop = this.output.scrollHeight;
    }

    clear() {
        this.output.innerHTML = '';
    }

    addCommand(command) {
        this.commands[command.name] = command;
        command.aliases.forEach(alias => this.commands[alias] = command);
    }

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
                case 'image': this.print(`This is an image file. To view it, type: render ${file.name}`); break;
                case 'audio': this.printHtml(`<audio controls src="${file.content}">Your browser does not support audio playback.</audio>`); break;
                case 'exe': this.print(`[Executable] To run this, type: run ${file.content}`); break;
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
            this.print(helpText);
        }));
        this.addCommand(new Command("run", "Run a registered addon", (args) => {
            if (!args[0]) { this.print("Usage: run <addon-name>"); return; }
            this.addonExecutor.startAddon(args[0], this, this.vOS, args.join(" "));
        }));
        this.addCommand(new Command("render", "Renders an image file.", (args) => {
          if (!args[0]) { this.print("Usage: render <filename>"); return; }
          this.addonExecutor.startAddon('image', this, this.vOS, `render ${args[0]}`);
        }));
        this.addCommand(new Command("exit", "Exits the current addon.", () => {
            if (!this.addonExecutor.activeAddon) { this.print("No active addon to exit."); return; }
            this.addonExecutor.stopAddon();
        }));
    }

    runCommand(input) {
        input = input.trim();
        if (!input) return;

        this.print(`> ${input}`);
        this.commandHistory.push(input);

        if (input.startsWith('!')) {
            const idx = parseInt(input.substring(1), 10) - 1;
            const cmd = this.commandHistory[idx];
            if (cmd) {
                this.runCommand(cmd);
            } else {
                this.print("Invalid history index.");
            }
            return;
        }

        if (this.addonExecutor.activeAddon) {
            if (input.toLowerCase() === 'exit') {
                this.addonExecutor.stopAddon();
            } else {
                this.addonExecutor.handleCommand(input);
            }
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
                this.print(`${prefix}${decorator}${child.name}`);
            }
        });
    }
}
