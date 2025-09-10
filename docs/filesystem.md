# Virtual File System

The CWP Open Terminal Emulator includes a virtual file system (VFS) that simulates a real file system in the browser's memory. This allows you and your users to create, manage, and interact with files and directories within the terminal environment.

The VFS can be populated in three primary ways:
1.  **Automated Generation:** Importing an entire directory structure from a JSON file.
2.  **Programmatic Creation:** Adding files and directories manually using code.
3.  **Command-Line Interaction:** Using built-in commands like `mkdir` and `touch`.

---

## 1. Automated Generation from a JSON File

This is the most powerful method for setting up a complete file system. It uses the `bin/vfs-importer.cjs` script to create a `vfs.json` file and a loader function in your application to import it.

### Step 1: Create the VFS JSON File

First, generate the JSON file from a source directory in your project.

**Usage:**
```bash
node bin/vfs-importer.cjs <source_directory> <output_file.json>
```
**Example:**
```bash
node bin/vfs-importer.cjs ./public ./vfs.json
```

This script handles both text files and binary files (like images), creating links for binary assets as described in the "Handling Different File Types" section below.

### Step 2: Load the JSON File into the Terminal

Before you boot the terminal, you must fetch and load the `vfs.json` file. This is typically done in your main application script where you initialize the terminal.

**Example Implementation:**
```javascript
// Import the necessary classes
import { CentralTerminal, VOS } from '../src/index.js';

// Create an instance of your terminal
const term = new CentralTerminal('terminal-container');

// Define an async function to load the VFS
async function loadFileSystem() {
  try {
    // Fetch the JSON file from your server
    const response = await fetch('./vfs.json'); // Ensure this path is correct
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const vfsData = await response.json();

    // Use VOS.fromJSON() to replace the default empty VFS
    term.vOS = VOS.fromJSON(vfsData);
    console.log('Virtual File System loaded successfully.');

  } catch (error) {
    console.error('Failed to load Virtual File System:', error);
    term.vOS.writeFile('/error.txt', `Failed to load VFS: ${error.message}`);
  }
}

// Run the load function and then boot the terminal
(async () => {
  await loadFileSystem(); // Wait for the file system to be ready
  await term.boot();      // Then, boot the terminal
})();
```

---

## 2. Programmatic Manual Creation

You can directly manipulate the file system by calling methods on the `VOS` object, which is available on your terminal instance (`term.vOS`). This is useful for creating dynamic files or for setups that don't require a pre-generated JSON file.

| Method                                       | Description                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `writeFile(path, content, ftype, overwrite)` | Creates or updates a file. `ftype` is an optional string. `overwrite` defaults to `true`.                      |
| `readFile(path)`                             | Reads the content of a file. Returns the content as a string or `null`.         |
| `unlink(path)`                               | Deletes a file.                                                                 |
| `mkdir(path)`                                | Creates a new directory.                                                        |
| `rmdir(path)`                                | Removes an empty directory.                                                     |
| `ls(path)`                                   | Returns an array of names for files and directories at a given path.            |
| `chdir(path)`                                | Changes the current working directory.                                          |

**Comprehensive Example:**

This example demonstrates how to create a directory structure and various file types before booting the terminal. Ensure the URLs used for linked content point to real, accessible files on your server.

```javascript
import { CentralTerminal } from '../src/index.js';

const term = new CentralTerminal('terminal-container');

// Create a directory structure
term.vOS.mkdir('/home/user/media');

// 1. Create a standard text file
const welcomeMessage = 'Welcome! Check out the files in ~/media.';
term.vOS.writeFile('/home/user/welcome.txt', welcomeMessage);

// 2. Create a linked file for an image
term.vOS.writeFile(
  '/home/user/media/logo.png',
  '/path/to/your/logo.png', // URL to the real image file
  'link'                        // Set file type to 'link'
);

// 3. Create a linked file for an audio track
term.vOS.writeFile(
  '/home/user/media/track.mp3',
  '/path/to/your/audio.mp3', // URL to the real audio file
  'link'
);

// 4. Create a linked file for a video
term.vOS.writeFile(
  '/home/user/media/tutorial.mp4',
  '/path/to/your/video.mp4', // URL to the real video file
  'link'
);

// Now boot the terminal
term.boot();
```

**Expected `cat` Command Behavior:**

When the terminal starts, you can use `cat` to see how different file types are handled:

```bash
# List the newly created files
$ ls /home/user/media
logo.png  track.mp3  tutorial.mp4

# 1. 'cat' on a text file prints its content
$ cat /home/user/welcome.txt
Welcome! Check out the files in ~/media.

# 2. 'cat' on a linked image renders the image
$ cat /home/user/media/logo.png
# An <img> tag is created and the logo appears in the terminal

# 3. 'cat' on a linked audio file shows a player
$ cat /home/user/media/track.mp3
# An <audio> tag with controls appears in the terminal

# 4. 'cat' on a linked video file shows a player
$ cat /home/user/media/tutorial.mp4
# A <video> tag with controls appears in the terminal
```

---

## 3. Command-Line Interaction

Once the terminal is running, users can interact with the VFS using a standard set of commands.

*   `ls`: List the contents of a directory.
*   `cd`: Change the current working directory.
*   `mkdir`: Create a new directory.
*   `touch`: Create a new, empty file.
*   `cat`: Display the contents of a file.
*   `rm`: Delete a file.
*   `pwd`: Print the full path of the current working directory.

---

## Handling Different File Types

The VFS can handle both text-based files and binary files (like images, audio, or video) through a linking mechanism.

#### Text Files

For files with extensions like `.js`, `.txt`, `.md`, etc., the `vfs-importer.cjs` script reads the file's content and embeds it directly into the JSON output. These files are stored in memory and their content can be read directly with commands like `cat`.

#### Binary Files (Linked Files)

For binary files, embedding the content is inefficient. Instead, the importer creates a **link** to the actual file.

When the importer encounters a binary file (e.g., `.png`, `.jpg`, `.mp3`), it does not read the file's content. It creates a special file entry with `ftype: 'link'` and sets the `content` property to be a URL pointing to the real file's location.

**Example VFS JSON Output:**
```json
{
  "/README.md": {
    "type": "file",
    "content": "This is the readme content."
  },
  "/assets/logo.png": {
    "type": "file",
    "ftype": "link",
    "content": "/assets/logo.png"
  }
}
```

example of js base file index
```js
import { CentralTerminal } from '../src/index.js';

const term = new CentralTerminal('terminal-container');

// Create a directory structure
term.vOS.mkdir('/home/user/media');

// 1. Create a standard text file
const welcomeMessage = 'Welcome! Check out the files in ~/media.';
term.vOS.writeFile('/home/user/welcome.txt', welcomeMessage);

// 2. Create a linked file for an image
term.vOS.writeFile(
  '/home/user/media/logo.png',
  '/path/to/your/logo.png', // URL to the real image file
  'link'                        // Set file type to 'link'
);

// 3. Create a linked file for an audio track
term.vOS.writeFile(
  '/home/user/media/track.mp3',
  '/path/to/your/audio.mp3', // URL to the real audio file
  'link'
);

// 4. Create a linked file for a video
term.vOS.writeFile(
  '/home/user/media/tutorial.mp4',
  '/path/to/your/video.mp4', // URL to the real video file
  'link'
);

// Now boot the terminal
term.boot();
```

For this to work, you must ensure that your web server is configured to serve the directory containing the real files. When the terminal application needs to access a linked file, it uses the URL path stored in the `content` property to fetch the asset, rather than trying to read it from the virtual file system's memory. This allows the browser to handle the loading and rendering of images, audio, and other media as it normally would.
