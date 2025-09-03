import { Addon } from '/src/index.js';

class TopAddon extends Addon {
    constructor() {
        super('top');
        this.interval = null;
    }

    onStart(term, vOS) {
        super.onStart(term, vOS);
        this.term.print('Terminal Performance Monitor (press Ctrl+C to exit)');
        this.term.print('---------------------------------------------------');
        this.interval = setInterval(() => this.updateStats(), 1000);
    }

    updateStats() {
        const fileSystem = this.vOS.getFileSystem();
        const fileCount = Object.keys(fileSystem).length;
        const historyCount = this.term.getHistory().length;
        const addons = this.term.addonExecutor.getRegisteredAddons();
        const addonCount = Object.keys(addons).length;

        // Clear the screen and reprint the stats
        this.term.clear();
        this.term.print('Terminal Performance Monitor (press Ctrl+C to exit)');
        this.term.print('---------------------------------------------------');
        this.term.print(`Virtual File System: ${fileCount} files/dirs`);
        this.term.print(`Command History: ${historyCount} entries`);
        this.term.print(`Running Addons: ${addonCount}`);
        this.term.print('\nRegistered Addons:');
        Object.keys(addons).forEach(name => this.term.print(`- ${name}`));
        this.term.print('---------------------------------------------------');
    }

    onInput(input) {
        // A simple way to exit, similar to the editor
        if (input.trim() === 'Ctrl+C') {
            this.exitTop();
        }
    }

    exitTop() {
        clearInterval(this.interval);
        this.term.print('Exiting top.');
        this.exit();
    }

    onExit() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

export function register(addonExecutor) {
    addonExecutor.registerAddon(new TopAddon());
}
