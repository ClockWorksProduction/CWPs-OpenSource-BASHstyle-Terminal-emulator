import { Addon } from '../addon.js';

class ImageRenderingAddon extends Addon {
    constructor() {
        super('image');
    }

    onStart(term, vOS, addonExecutor, initialCommand) {
        super.onStart(term, vOS, addonExecutor);
        if (initialCommand) {
            const [command, ...args] = initialCommand.split(' ');
            if (command === 'render') {
                this.renderImage(args[0]);
            }
        }
    }

    renderImage(filename) {
        const file = this.vOS._resolvePath(filename);
        if (file && file.type === 'image') {
            this.term.printHtml(`<img src="${file.content}" alt="${file.name}" style="max-width: 100%; height: auto;">`);
        } else {
            this.term.print(`File not found or not an image: ${filename}`);
        }
        this.addonExecutor.stopAddon();
    }
}

export function register(addonExecutor) {
    addonExecutor.registerAddon(new ImageRenderingAddon());
}