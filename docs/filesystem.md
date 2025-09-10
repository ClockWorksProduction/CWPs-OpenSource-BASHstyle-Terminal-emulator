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

## Programmatic Access

The VFS can also be controlled programmatically from within your addons. The `VOS` (Virtual Operating System) class provides a simple API for file and directory manipulation. An instance of this class is available in your addons via `this.vOS`.

### Key Methods

The methods available on the `vOS` object directly mirror the core functionality documented in the **[API Reference](./api-reference.md#file--directory-operations)**.

| Method                                       | Description                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `writeFile(path, content, ftype, overwrite)` | Creates or updates a file. `overwrite` defaults to `true`.                      |
| `readFile(path)`                             | Reads the content of a file. Returns the content as a string or `null`.         |
| `unlink(path)`                               | Deletes a file.                                                                 |
| `mkdir(path)`                                | Creates a new directory.                                                        |
| `rmdir(path)`                                | Removes an empty directory.                                                     |
| `ls(path)`                                   | Returns an array of names for files and directories at a given path.            |
| `chdir(path)`                                | Changes the current working directory.                                          |
| `normalize(path)`                            | Resolves a path to its absolute form, handling `.` , `..`, and `~`.             |
| `resolve(path)`                              | Resolves a path to its corresponding `VFile` or `VDirectory` object.            |

### Example Usage in an Addon

Here is a simple example of how to use the VFS API within an addon to create a file, read it, and then delete it.

```javascript
// Inside an Addon class method

const filePath = this.vOS.normalize('~/my-new-file.txt');
const fileContent = 'Hello, Virtual World!';

// 1. Write the file
this.vOS.writeFile(filePath, fileContent);
this.term.writeln('File created.');

// 2. Read the file
const content = this.vOS.readFile(filePath);
this.term.writeln(`File content: ${content}`);

// 3. Delete the file
this.vOS.unlink(filePath);
this.term.writeln('File deleted.');
```

This programmatic access is the foundation for building powerful addons like the `edit` text editor, which uses these methods to load, save, and manage files.
