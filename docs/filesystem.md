# Virtual File System

The CWP Open Terminal Emulator includes a virtual file system (VFS) that simulates a real file system in the browser's memory. This allows you and your users to create, manage, and interact with files and directories within the terminal environment.

## The `VOS` Class

The virtual file system is managed by the `VOS` (Virtual Operating System) class. An instance of this class is automatically created when you initialize the `CentralTerminal` and is accessible within addons via the `this.vOS` property.

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

## File and Directory Operations

The VFS supports a standard set of operations for managing files and directories, which are exposed through the default terminal commands.

*   `ls`: List the contents of a directory.
*   `cd`: Change the current working directory.
*   `mkdir`: Create a new directory.
*   `touch`: Create a new, empty file.
*   `cat`: Display the contents of a file.
*   `rm`: Delete a file.
*   `pwd`: Print the full path of the current working directory.

## Interacting with the VFS Programmatically

When developing addons, you can directly interact with the VFS using the methods provided by the `VOS` class.

```javascript
class FilesystemAddon extends Addon {
    constructor() {
        super('fs-demo');
    }

    onStart(term, vOS) {
        this.term.print("Demonstrating file system access.");

        // Get the current working directory
        const cwd = this.vOS._getFullPath(this.vOS.cwd);
        this.term.print(`Current directory: ${cwd}`);

        // Create a new file
        const filePath = `${cwd}/my-new-file.txt`;
        const success = this.vOS.createFile(filePath, "Hello from the addon!");

        if (success) {
            this.term.print(`Created file: ${filePath}`);
        } else {
            this.term.print("Failed to create file.");
        }

        // Read the file
        const file = this.vOS._resolvePath(filePath);
        if (file) {
            this.term.print(`File content: ${file.content}`);
        }
    }
}
```
