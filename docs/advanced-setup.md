# Advanced Setup: Modular Configuration

This guide is for developers who want to take their terminal customization to the next level. While the basic setup is straightforward, a modular approach allows you to keep your configuration clean and manageable by separating different components into their own files.

This is especially useful for complex setups, such as those with a large number of virtual files or a lengthy, dynamic welcome message.

---

## Core Concept

The strategy is to store your configuration data in separate files (e.g., `.txt` or `.json`) and then use a browser's `fetch` API to load them into your main application script. Once loaded, you can use the terminal's public API to apply the configuration.

This approach has several advantages:

*   **Organization**: Keeps your main JavaScript file clean and focused on logic rather than static data.
*   **Maintainability**: You can edit your BIOS text or file system without digging through JavaScript code.
*   **Collaboration**: Different team members can work on different parts of the configuration simultaneously.

---

## Tutorial: A Fully Modular Setup

In this tutorial, we will create a project with the following structure:

```
/my-terminal-project
|-- index.html
|-- style.css
|-- app.js
|-- /config
|   |-- bios.txt
|   |-- motd.txt
|   |-- file-system.json
```

### Step 1: Create Your Static Configuration Files

First, create a `config` directory for your static text files.

**`config/bios.txt`**

This file will contain the text displayed during the boot animation.

```text
ACME Corp. Secure BIOS v2.1
(c) 2024 ACME Corporation

Initializing...
System Check: OK
Memory Check: OK
Loading VFS...
```

**`config/motd.txt`**

This is the "Message of the Day" that is displayed after the terminal has booted.

```text
Welcome, user!

This is the ACME Corp. internal terminal. Unauthorized access is strictly prohibited.
Type `help` to see the list of available commands.
```

---

### Step 2: Create Your Virtual File System

You have two excellent options for creating the `file-system.json` file. 

#### Option A: Manually Create `file-system.json` (Recommended for Control)

This method gives you full, granular control over the file system and is perfect for defining a specific file layout from scratch. Create a `file-system.json` file inside your `config` directory.

The structure is a simple JSON object where keys are the **full virtual paths** to your files, and values are objects that define the file.

**`config/file-system.json`**
```json
{
  "/home/user/README.md": {
    "type": "file",
    "content": "This is a README file in the user's home directory."
  },
  "/docs/api.txt": {
    "type": "file",
    "content": "API Documentation.\nVersion 1.0"
  }
}
```

**Key Points:**
*   **Directories are created automatically:** You only need to define the files. The terminal will create parent directories (`/home/user`, `/docs`) automatically when it imports the file system.
*   **`type`: "file"**: For now, only the `file` type is used for these definitions.
*   **`content`**: The content of the file as a string. Remember to correctly escape special characters like newlines (`\n`) and quotes (`\"`).

#### Option B: Generate `file-system.json` from a Local Directory (Recommended for Speed)

If you have a large number of files or an existing folder structure you want to replicate, you can use the included **VFS Importer** tool.

**1. Create Your Local File Structure:**
First, create a directory on your local machine that mirrors the virtual file system you want.

```
/my-vfs-source
|-- README.md
|-- /docs
|   |-- guide.txt
```

**2. Run the VFS Importer:**
Next, use `npx` to run the tool, providing your source directory and desired output file.

```bash
npx @clockworksproduction-studio/cwp-vfs-importer ./my-vfs-source ./config/file-system.json
```

The importer will scan `./my-vfs-source` and create a `file-system.json` in your `./config` directory, ready to be loaded.

---

### Step 3: Update the Main Application (`app.js`)

Now, modify your `app.js` to fetch these files and configure the terminal. This example builds on the standard manual setup.

```javascript
import { CentralTerminal } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/core/central-terminal.js''';

document.addEventListener('DOMContentLoaded', async () => {
  const term = new CentralTerminal('#terminal');

  try {
    // --- Load External Configurations ---
    const [biosResponse, motdResponse, fsResponse] = await Promise.all([
      fetch('./config/bios.txt'),
      fetch('./config/motd.txt'),
      fetch('./config/file-system.json')
    ]);

    const biosText = await biosResponse.text();
    const motdText = await motdResponse.text();
    const fsData = await fsResponse.json();

    // --- Apply the Configurations ---

    // Set the custom BIOS text (this replaces the default)
    term.setBootupText(biosText);

    // Import the file system structure
    // The second argument `true` clears the default file system first
    term.vOS.import(fsData, true);

    // --- Boot the Terminal ---
    await term.boot();

    // --- Display the Custom Welcome Message ---
    // We print this *after* boot to ensure it appears after the prompt.
    term._print(motdText);

    console.log('Terminal has been successfully booted with a modular configuration!');

  } catch (error) {
    console.error("Failed to initialize terminal with modular config:", error);
    const termContainer = document.querySelector('#terminal');
    if (termContainer) {
        termContainer.innerHTML = '<div style="color: red; padding: 15px;"><strong>Error:</strong> Failed to load terminal configuration. See console for details.</div>';
    }
  }
});
```

### How It Works

1.  **`Promise.all`**: We use `Promise.all` with `fetch` to load all configuration files in parallel for maximum efficiency.
2.  **`setBootupText(text)`**: This method on the `CentralTerminal` instance overrides the default BIOS text that is shown during the boot animation.
3.  **`vOS.import(data, clear)`**: This powerful method on the Virtual Operating System (`vOS`) takes a JSON object and builds the file system from it. Setting the second argument to `true` ensures that the default files (like `/etc/motd`) are wiped first, giving you a clean slate.
4.  **`term._print(text)`**: We manually print the welcome message *after* the `term.boot()` method has completed. This is because the boot process itself may print messages, and this ensures our welcome message is the last thing the user sees.

---

## Conclusion

By following this modular approach, you can create highly customized and easy-to-manage terminal configurations. Whether you choose to build your file system manually for fine-grained control or use the importer for speed, this pattern can be extended for any kind of data you want to load at runtime.
