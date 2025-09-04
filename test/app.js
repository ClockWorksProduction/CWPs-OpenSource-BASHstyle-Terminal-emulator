import { CentralTerminal } from '../src/index.js';
import { FilesystemAddon } from '../addons/filesystem_addon.js';
import { PackageManagerAddon } from '../addons/pkg_manager.js';
import { NetAddon } from '../addons/net.js';
import { EditorAddon } from '../addons/editor.js';
import { RPSAddon } from '../addons/rps_addon.js';
import { TopAddon } from '../addons/top.js';
import { TreeCommand } from '../addons/tree.js';

document.addEventListener('DOMContentLoaded', () => {
    const term = new CentralTerminal('#central-terminal-container');

    // Register all the necessary addons
    term.registerAddon(new FilesystemAddon());
    term.registerAddon(new PackageManagerAddon());
    term.registerAddon(new NetAddon());
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RPSAddon());
    term.registerAddon(new TopAddon());

    // Register the tree command
    term.addCommand(TreeCommand);

    // Boot the terminal
    term.boot();
});
