# Virtual File System

The CWP Open Terminal Emulator includes a virtual file system (VFS) that simulates a real file system in the browser's memory. This allows you and your users to create, manage, and interact with files and directories within the terminal environment.

## Default File Structure

When the terminal boots, it creates a default directory structure to provide a familiar starting environment:

```
/
├── bin/
├── etc/
│   └── motd
└── home/
    └── user/
        └── README.txt
```

## Command-Line Interaction

The VFS supports a standard set of operations for managing files and directories, which are exposed through the default terminal commands:

*   `ls`: List the contents of a directory.
*   `cd`: Change the current working directory.
*   `mkdir`: Create a new directory.
*   `touch`: Create a new, empty file.
*   `cat`: Display the contents of a file.
*   `rm`: Delete a file.
*   `pwd`: Print the full path of the current working directory.

---

## Programmatic API (`VOS`)

When developing addons, you can directly interact with the VFS using the methods provided by the `VOS` (Virtual Operating System) class. An instance of this class is passed to your addon's `onStart` method.

### Key Methods

| Method                  | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `createFile(path, content)` | Creates a new file with optional content.              |
| `readFile(path)`        | Reads the content of a file. Returns a string.       |
| `updateFile(path, content)` | Overwrites the content of an existing file.          |
| `deleteFile(path)`      | Deletes a file.                                        |
| `createDirectory(path)` | Creates a new directory.                               |
| `listDirectory(path)`   | Returns an array of file and directory names.        |
| `getFullPath(path)`     | Resolves a relative path to a full, absolute path.   |
| `pathExists(path)`      | Checks if a file or directory exists at the given path.|

### Example Usage in an Addon

The following example demonstrates how to use the `VOS` API to create, read, and manage files from within an addon.

```javascript
import { Addon } from '/src/index.js';

class FilesystemAddon extends Addon {
    constructor() {
        super('fs-demo');
    }

    onStart(term, vOS) {
        this.term.print("Demonstrating file system access...");

        // The vOS instance is received here
        this.vOS = vOS;

        // Get the full path to the user's home directory
        const homeDir = this.vOS.getFullPath('~/_docs');
        const filePath = `${homeDir}/demo-file.txt`;

        // 1. Create a directory
        if (!this.vOS.pathExists(homeDir)) {
            this.vOS.createDirectory(homeDir);
            this.term.print(`Created directory: ${homeDir}`)
        }

        // 2. Create a file
        const content = "Hello from a CWP addon!";
        if (this.vOS.createFile(filePath, content)) {
            this.term.print(`Successfully created file: ${filePath}`);
        } else {
            this.term.print(`File already exists: ${filePath}`);
        }

        // 3. Read the file
        const fileContent = this.vOS.readFile(filePath);
        if (fileContent !== null) {
            this.term.print(`Content of ${filePath}:`);
            this.term.print(`> ${fileContent}`);
        } else {
            this.term.print(`Could not read file: ${filePath}`);
        }

        this.exit();
    }
}
```
