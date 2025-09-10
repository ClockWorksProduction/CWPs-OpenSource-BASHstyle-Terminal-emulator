# Building Addons (v5.1+)

This guide provides a comprehensive walkthrough of the CWP Open Terminal Emulator's addon system. It is designed for developers who want to extend the terminal's functionality by creating their own sub-applications.

---

## Addon Architecture

The terminal features a powerful addon system that allows for the creation of self-contained applications within the main terminal environment. When an addon is active, it takes full control of the user input loop, allowing for a completely unique set of commands and interactions.

### Core Concepts

1.  **`Addon` (Base Class):** All addons must extend this class. It provides the essential structure (`constructor`, lifecycle methods) that the terminal uses to manage the addon.

2.  **`AddonExecutor`:** This is an internal manager responsible for registering, starting, stopping, and routing all input to the currently active addon.

3.  **Hijacking the Prompt:** When an addon starts, the `AddonExecutor` changes the terminal prompt (e.g., from `$` to `(notepad)>`) and forwards all user input directly to the addon's `handleCommand` method. This continues until the addon calls `this.exit()`.

---

## Tutorial: Building a "Notepad" Addon

Let's build a practical addon: a simple `notepad` for creating and viewing short notes. This will demonstrate state, file system interaction, and custom commands.

### Step 1: Create the Addon Class

First, define a new class that extends `Addon`, which you will import from the package.

```javascript
// In a new file, e.g., NotepadAddon.js
import { Addon } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/addons/addon.js''';

// Extend the base Addon class
class NotepadAddon extends Addon {
    constructor() {
        // 1. Call super() with an options object for the addon's configuration.
        // The `name` is used to invoke the addon (e.g., `run notepad`).
        super({ name: 'notepad' }); // `isTopLevel` defaults to false

        // 2. Initialize the addon's internal state.
        this.notes = {}; // A simple object to hold our notes by title.

        // 3. Register the addon-specific commands.
        // Every addon automatically gets `help` and `exit`.
        this.addCommand('new', 'Create a new note', args => this.newNote(args));
        this.addCommand('view', 'View a note', args => this.viewNote(args));
        this.addCommand('list', 'List all notes', () => this.listNotes());
        this.addCommand('save', 'Save notes to the file system', () => this.save());
        this.addCommand('load', 'Load notes from the file system', () => this.load());
    }

    // ... more methods to come
}
```

### Step 2: Implement Lifecycle Methods

Lifecycle methods are the entry and exit points for your addon.

*   `onStart(args)`: Called when the user runs `run notepad`.
*   `onStop()`: Called when the user runs `exit` from within the addon.

```javascript
// Inside the NotepadAddon class

// onStart is the entry point.
onStart(args) {
    this.term.clear();
    this.term._print('--- Notepad Addon ---');
    this.term._print('Welcome! Type `help` for a list of commands.');
    
    // Automatically load previous notes.
    this.load(); 
}

// onStop is the exit point.
onStop() {
    // A good practice is to remind the user to save.
    this.term._print('Exiting Notepad. Don\'t forget to save your work!');
}
```

### Step 3: Define Custom Command Logic

Now, implement the methods that your registered commands call. These methods have access to the `CentralTerminal` instance via `this.term` and the virtual file system via `this.vOS`.

```javascript
// Inside the NotepadAddon class

newNote(args) {
    const title = args.shift();
    const content = args.join(' ');
    if (!title || !content) {
        this.term._print('Usage: new <title> <content>');
        return;
    }
    this.notes[title] = content;
    this.term._print(`Note created: "${title}"`);
}

viewNote(args) {
    const title = args[0];
    if (!title || !this.notes[title]) {
        this.term._print('Note not found.');
        return;
    }
    this.term._print(`--- ${title} ---\n${this.notes[title]}`);
}

listNotes() {
    const titles = Object.keys(this.notes);
    if (titles.length === 0) {
        this.term._print('No notes yet.');
        return;
    }
    this.term._print('--- All Notes ---\n' + titles.join('\n'));
}
```

### Step 4: Interact with the Virtual File System

To make the notes persistent, we need to save and load them from the `VOS`.

```javascript
// Inside the NotepadAddon class

getNotesFilePath() {
    // Use a consistent location in the virtual home directory.
    return this.vOS.normalize('~/notepad.json');
}

save() {
    const path = this.getNotesFilePath();
    const jsonContent = JSON.stringify(this.notes, null, 2);
    
    // Use the vOS to write the file.
    if (this.vOS.writeFile(path, jsonContent, 'text', true)) {
        this.term._print('Notes saved successfully.');
    } else {
        this.term._print('Error: Could not save notes.');
    }
}

load() {
    const path = this.getNotesFilePath();
    const jsonContent = this.vOS.readFile(path);

    if (jsonContent) {
        try {
            this.notes = JSON.parse(jsonContent);
            this.term._print('Notes loaded successfully.');
        } catch (e) {
            this.term._print('Error: Could not parse notes file.');
        }
    } else {
        this.term._print('No saved notes file found. Starting fresh.');
    }
}
```

### Step 5: Register the Addon

Finally, import your new addon and register it with the main `CentralTerminal` instance before booting.

```javascript
// In your main application file (e.g., app.js)
import { CentralTerminal } from '''@clockworksproduction-studio/cwp-open-terminal-emulator/core/central-terminal.js''';
import { NotepadAddon } from '''./NotepadAddon.js'''; // Import your custom addon

const term = new CentralTerminal('#terminal-container');

// Register the addon instance
term.registerAddon(new NotepadAddon());

// Boot the terminal
await term.boot();
```

### Final Usage

Once registered, the addon is fully usable:

```bash
$ run notepad
(notepad)> new MyFirstNote This is the content.
(notepad)> save
(notepad)> exit
$
```

---

## Best Practices

*   **Clear Feedback:** Always print messages to the user to confirm actions (`Note saved`, `File not found`, etc.).
*   **Use `onStart` and `onStop`:** Use the lifecycle methods for setup and cleanup. Avoid doing heavy work in the constructor.
*   **State Management:** For simple state, internal properties are fine. For complex state, consider saving to the `VOS` frequently.
*   **Error Handling:** Check for the existence of files before reading them. Use `try...catch` blocks when parsing data like JSON.
*   **Help Command:** Rely on the built-in `help` command. Just use `this.addCommand()` with a clear description, and it will be automatically included.
