import { Addon } from '../terminal.js';

const addonRegistry = {
    'cowsay': 'https://raw.githubusercontent.com/user/repo/branch/path/to/cowsay.js',
    'sl': 'https://raw.githubusercontent.com/user/repo/branch/path/to/sl.js'
    // Add more addons here
};

class PackageManagerAddon extends Addon {
    constructor() {
        super('tpkg');
    }

    onStart(term, vOS, ...args) {
        super.onStart(term, vOS, ...args);
        const [command, ...rest] = args;

        switch (command) {
            case 'install':
                this.install(rest[0]);
                break;
            case 'list':
                this.list();
                break;
            case 'remove':
                this.remove(rest[0]);
                break;
            default:
                this.term.print('Usage: tpkg [install|list|remove] <addon-name>');
                this.exit();
        }
    }

    async install(addonName) {
        if (!addonName) {
            this.term.print('Usage: tpkg install <addon-name>');
            this.exit();
            return;
        }

        const url = addonRegistry[addonName];
        if (!url) {
            this.term.print(`Addon not found: ${addonName}`);
            this.exit();
            return;
        }

        this.term.print(`Installing ${addonName}...`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const addonCode = await response.text();
            const addonPath = `/.addons/${addonName}.js`;
            this.vOS.writeFile(addonPath, addonCode);
            this.term.print(`${addonName} installed successfully.`);

            // You would need a way to dynamically load and register the new addon
            this.term.print(`To use ${addonName}, restart the terminal.`);

        } catch (error) {
            this.term.print(`Failed to install ${addonName}: ${error.message}`);
        }
        this.exit();
    }

    list() {
        this.term.print('Available addons in registry:');
        Object.keys(addonRegistry).forEach(name => this.term.print(`- ${name}`));
        
        this.term.print('\nInstalled addons:');
        try {
            const installed = this.vOS.readDir('/.addons');
            installed.forEach(item => this.term.print(`- ${item.name.replace('.js', '')}`));
        } catch (e) {
            this.term.print('No addons installed yet.');
        }

        this.exit();
    }

    remove(addonName) {
        if (!addonName) {
            this.term.print('Usage: tpkg remove <addon-name>');
            this.exit();
            return;
        }

        const addonPath = `/.addons/${addonName}.js`;
        try {
            this.vOS.deleteFile(addonPath);
            this.term.print(`${addonName} removed successfully.`);
        } catch (e) {
            this.term.print(`Failed to remove ${addonName}: ${e.message}`);
        }
        this.exit();
    }
}

export function register(addonExecutor) {
    addonExecutor.registerAddon(new PackageManagerAddon());
}
