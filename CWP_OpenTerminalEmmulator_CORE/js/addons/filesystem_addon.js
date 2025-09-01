import { Addon } from '../addon.js';

class FilesystemAddon extends Addon {
    constructor() {
        super('filesystem');
    }

    onStart(term, vOS) {
        super.onStart(term, vOS);
        const readmeContent = `
Welcome to the CWP Terminal Emulator!

This is a virtual filesystem. Here are some commands you can use:

- **ls**: List files and directories.
- **cd <directory>**: Change the current directory.
- **cat <file>**: Display the contents of a file.
- **pwd**: Show the current working directory.
- **mkdir <directory>**: Create a new directory.
- **touch <file>**: Create a new empty file.
- **tree**: Display the directory structure.

Explore the filesystem and try out the commands!
`;
        vOS.createFile('/readme.txt', readmeContent.trim());
    }
}

export function register(addonExecutor) {
    addonExecutor.registerAddon(new FilesystemAddon());
}
