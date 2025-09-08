# Default Commands

This document provides a detailed reference for all the default commands available in the CWP Open Terminal Emulator.

---

### `cat`

Displays the contents of a file.

*   **Usage**: `cat [file]`
*   **Example**:
    ```bash
    cat /etc/motd
    ```

---

### `cd`

Changes the current working directory.

*   **Usage**: `cd [directory]`
*   **Details**: Supports absolute paths (e.g., `/home/user`) and relative paths (e.g., `../` or `mydir`). Running `cd` without an argument will typically return you to the home directory (`/home/user`).
*   **Examples**:
    ```bash
    # Navigate to a directory
    cd /usr/bin

    # Go up one level
    cd ..
    ```

---

### `clear`

Clears all previous output from the terminal screen.

*   **Usage**: `clear`

---

### `date`

Displays the current system date and time.

*   **Alias**: `time`
*   **Usage**: `date`

---

### `echo`

Prints text to the terminal.

*   **Usage**: `echo [text]`
*   **Example**:
    ```bash
    echo "Hello, World!"
    ```

---

### `exit`

Exits the currently running addon and returns to the main terminal prompt. This command has no effect in the main terminal.

*   **Usage**: `exit`

---

### `help`

Lists all available commands.

*   **Usage**: `help`

---

### `history`

Displays a list of previously executed commands.

*   **Usage**: `history`
*   **Details**: You can re-run a command from the history list using its number with an exclamation mark.
*   **Example**:
    ```bash
    # Display command history
    history

    # If 'ls -l' was command number 5, this will re-run it
    !5
    ```

---

### `ls`

Lists the files and directories in the current directory or a specified path.

*   **Usage**: `ls [options] [path]`
*   **Details**: Accepts standard flags like `-l` for a long list format and `-a` to show hidden files.
*   **Examples**:
    ```bash
    # List contents of the current directory
    ls

    # List contents of a different directory
    ls /etc

    # Use long list format
    ls -l
    ```

---

### `mkdir`

Creates a new directory.

*   **Usage**: `mkdir [directory_name]`
*   **Example**:
    ```bash
    mkdir my-new-project
    ```

---

### `pwd`

Prints the current working directory path.

*   **Usage**: `pwd`

---

### `rm`

Deletes a file. This action is permanent.

*   **Usage**: `rm [file]`
*   **Example**:
    ```bash
    rm old_data.txt
    ```

---

### `run`

Starts a registered addon.

*   **Usage**: `run [addon_command] [args...]`
*   **Details**: This command is used to launch addons. Any arguments passed after the addon command will be sent to the addon itself.
*   **Example**:
    ```bash
    # Start the text editor addon to create a new file
    run edit my_document.txt
    ```

---

### `touch`

Creates a new, empty file.

*   **Usage**: `touch [file_name]`
*   **Example**:
    ```bash
    touch log.txt
    ```

---

### `tree`

Displays the directory structure as a tree.

*   **Usage**: `tree`
