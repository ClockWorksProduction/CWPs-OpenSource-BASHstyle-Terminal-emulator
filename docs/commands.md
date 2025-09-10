# Default Commands

This document provides a detailed reference for all the default commands available in the CWP Open Terminal Emulator.

---

### `aafire`

Displays an ASCII fire animation.

*   **Usage**: `aafire`
*   **Details**: Runs a continuous animation. Press `Ctrl+C` to stop.

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
*   **Details**: Supports absolute paths (e.g., `/home/user`) and relative paths (e.g., `../` or `mydir`). Running `cd` without an argument or with `~` will return you to the home directory (`/home/user`).
*   **Examples**:
    ```bash
    # Navigate to a directory
    cd /usr/bin

    # Go up one level
    cd ..

    # Go to home directory
    cd
    ```

---

### `chmod`

Simulates changing file permissions. This is a mock command.

*   **Usage**: `chmod [permissions] [file]`
*   **Example**:
    ```bash
    chmod 755 my_script.sh
    ```

---

### `chown`

Simulates changing file ownership. This is a mock command.

*   **Usage**: `chown [user] [file]`
*   **Example**:
    ```bash
    chown new_owner my_file.txt
    ```

---

### `chgrp`

Simulates changing file group. This is a mock command.

*   **Usage**: `chgrp [group] [file]`
*   **Example**:
    ```bash
    chgrp new_group my_file.txt
    ```

---

### `clear`

Clears all previous output from the terminal screen.

*   **Usage**: `clear`

---

### `cmatrix`

Displays a Matrix-style falling text animation.

*   **Usage**: `cmatrix`
*   **Details**: Runs a continuous animation. Press `Ctrl+C` to stop.

---

### `cp`

Copies a file from a source to a destination.

*   **Usage**: `cp [source_file] [destination_file]`
*   **Example**:
    ```bash
    cp /docs/guide.txt /home/user/guide-copy.txt
    ```

---

### `curl`

Simulates fetching a URL. This is a mock command.

*   **Usage**: `curl [url]`
*   **Example**:
    ```bash
    curl https://example.com
    ```

---

### `date`

Displays the current system date and time.

*   **Usage**: `date`

---

### `df`

Simulates displaying disk usage.

*   **Usage**: `df`

---

### `du`

Simulates displaying directory usage.

*   **Usage**: `du [directory]`

---

### `echo`

Prints text to the terminal.

*   **Usage**: `echo [text]`
*   **Example**:
    ```bash
    echo "Hello, World!"
    ```

---

### `edit`

Starts the text editor addon to edit a file.

*   **Alias**: `vim`
*   **Usage**: `edit [file_path]`
*   **Example**:
    ```bash
    edit my_document.txt
    ```

---

### `exit`

Exits the currently running addon and returns to the main terminal prompt. This command has no effect in the main terminal.

*   **Usage**: `exit`

---

### `find`

Simulates finding files. This is a mock command.

*   **Usage**: `find [path] -name [pattern]`

---

### `free`

Simulates displaying memory information.

*   **Usage**: `free`

---

### `grep`

Searches for a pattern within a file.

*   **Usage**: `grep [pattern] [file]`
*   **Example**:
    ```bash
    grep "hello" /docs/guide.txt
    ```

---

### `head`

Displays the first few lines of a file.

*   **Usage**: `head [file] [lines]`
*   **Default**: Shows the first 10 lines.
*   **Example**:
    ```bash
    # Show the first 5 lines of a file
    head /docs/guide.txt 5
    ```

---

### `help`

Lists all available commands.

*   **Usage**: `help`

---

### `hclear`

Clears the entire command history.

*   **Usage**: `hclear`
*   **Details**: Removes all commands from the current session's history and also deletes the history from persistent storage (`localStorage`).

---

### `history`

Displays a list of previously executed commands.

*   **Usage**: `history`

---

### `kill`

Simulates killing a process. This is a mock command.

*   **Usage**: `kill [pid]`

---

### `ln`

Simulates creating a symbolic link. This is a mock command.

*   **Usage**: `ln -s [target] [link_name]`

---

### `ls`

Lists the files and directories in the current directory or a specified path.

*   **Usage**: `ls [path]`
*   **Example**:
    ```bash
    ls /etc
    ```

---

### `mkdir`

Creates a new directory. Supports the `-p` flag to create parent directories recursively.

*   **Usage**: `mkdir [-p] [directory_name]`
*   **Example**:
    ```bash
    mkdir my-project
    mkdir -p my/nested/project
    ```

---

### `mv`

Moves or renames a file.

*   **Usage**: `mv [source] [destination]`
*   **Example**:
    ```bash
    # Rename a file
    mv old.txt new.txt

    # Move a file to a new directory
    mv new.txt /docs
    ```

---

### `pgrep`

Simulates finding a process by name. This is a mock command.

*   **Usage**: `pgrep [process_name]`

---

### `ping`

Simulates sending a ping to a host.

*   **Usage**: `ping [host]`
*   **Example**:
    ```bash
    ping example.com
    ```

---

### `pkill`

Simulates killing a process by name. This is a mock command.

*   **Usage**: `pkill [process_name]`

---

### `ps`

Simulates listing active processes.

*   **Usage**: `ps`

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

### `rmdir`

Deletes an empty directory.

*   **Usage**: `rmdir [directory]`
*   **Example**:
    ```bash
    rmdir my-empty-folder
    ```

---

### `rps`

Starts the Rock, Paper, Scissors game addon.

*   **Usage**: `rps`

---

### `run`

Starts a registered addon.

*   **Usage**: `run [addon_command] [args...]`
*   **Example**:
    ```bash
    run edit my_document.txt
    ```

---

### `tail`

Displays the last few lines of a file.

*   **Usage**: `tail [file] [lines]`
*   **Default**: Shows the last 10 lines.
*   **Example**:
    ```bash
    # Show the last 5 lines of a file
    tail /docs/guide.txt 5
    ```

---

### `top`

Simulates a process monitor. This is a mock command.

*   **Usage**: `top`

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

*   **Usage**: `tree [path]`

---

### `umask`

Simulates showing the umask value.

*   **Usage**: `umask`

---

### `uname`

Displays system information.

*   **Usage**: `uname`

---

### `uptime`

Simulates showing the system uptime.

*   **Usage**: `uptime`

---

### `whoami`

Displays the current user.

*   **Usage**: `whoami`
