export class AddonExecutor {
    constructor() {
        this.addons = {};
        this.activeAddon = null;
    }

    registerAddon(name, addonInstance) {
        this.addons[name] = addonInstance;
    }

    startAddon(name, term, vos, command) {
        const addon = this.addons[name];
        if (addon) {
            this.activeAddon = addon;
            addon.onStart(term, vos, command);
        } else {
            term.print(`Addon not found: ${name}`);
        }
    }

    stopAddon() {
        if (this.activeAddon) {
            this.activeAddon.onStop();
            this.activeAddon = null;
        }
    }

    handleCommand(command) {
        if (this.activeAddon) {
            this.activeAddon.onCommand(command);
        }
    }
}
