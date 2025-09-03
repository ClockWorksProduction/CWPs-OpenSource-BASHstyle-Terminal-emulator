import { Addon } from '../terminal.js';

class EditorAddon extends Addon {
    constructor() {
        super('edit');
        this.fileContent = '';
        this.filePath = '';
        this.isEditing = false;
    }

    onStart(term, vOS, ...args) {
        super.onStart(term, vOS, ...args);
        if (args.length === 0) {
            this.term.print('Usage: edit <filename>');
            this.exit();
            return;
        }

        this.filePath = this.vOS.resolvePath(args[0]);
        this.isEditing = true;

        try {
            this.fileContent = this.vOS.readFile(this.filePath);
        } catch (e) {
            // File does not exist, so we start with an empty file
            this.fileContent = '';
        }

        this.term.print(`Editing ${this.filePath}. Press Ctrl+S to save, Ctrl+X to exit.`);
        this.term.print('--------------------------------------------------');
        this.term.print(this.fileContent);
        this.term.print('--------------------------------------------------');
        this.term.setPrompt(''); // Hide prompt while editing
    }

    onInput(input) {
        if (!this.isEditing) return;

        // For simplicity, we handle Ctrl+S and Ctrl+X via their string representations
        // In a real scenario, you would listen for keydown events to capture control keys
        if (input.trim() === 'Ctrl+S') {
            this.saveFile();
        } else if (input.trim() === 'Ctrl+X') {
            this.exitEditor();
        } else {
            this.fileContent += input + '\n';
            this.term.print(input);
        }
    }

    saveFile() {
        try {
            this.vOS.writeFile(this.filePath, this.fileContent);
            this.term.print('File saved.');
        } catch (e) {
            this.term.print(`Error saving file: ${e.message}`);
        }
    }

    exitEditor() {
        this.isEditing = false;
        this.term.setPrompt('>'); // Restore prompt
        this.term.print('Exiting editor.');
        this.exit();
    }
}

export function register(addonExecutor) {
    addonExecutor.registerAddon(new EditorAddon());
}
