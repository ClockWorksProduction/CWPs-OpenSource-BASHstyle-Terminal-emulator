import { Addon } from '../index.js';

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

export { EditorAddon };
