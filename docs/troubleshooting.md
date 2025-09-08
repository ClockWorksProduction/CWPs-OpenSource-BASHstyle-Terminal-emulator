# Troubleshooting and FAQ

This document provides troubleshooting tips and answers to frequently asked questions.

## Common Issues

### 1. Commands Not Working as Expected

*   **Check for Typos:** The command parser is case-sensitive. Make sure you are typing the command and its arguments correctly.
*   **Verify the Command Exists:** Use the `help` command to see a list of available commands. If the command you are trying to use is not on the list, it may be part of an addon that is not installed.
*   **Check Addon Status:** If the command is part of an addon, use `tpkg list` to verify that the addon is installed and enabled.

### 2. Addon Installation Failures

*   **Check the Package Name:** Ensure you are using the correct package name when trying to install an addon with `tpkg install`.
*   **Network Connection:** The terminal emulator uses a virtual network. While it doesn't connect to the internet, make sure the addon repository is correctly configured.

### 3. Filesystem Errors

*   **Permissions:** The virtual filesystem has a permission system. If you are unable to read, write, or delete a file, use the `ls -l` command to check the file's permissions.
*   **Correct Path:** Make sure you are providing the correct path to the file or directory. Use the `pwd` command to see your current location and `ls` to see the contents of the current directory.

## Frequently Asked Questions (FAQ)

### Q: How do I create a new file?

**A:** You can create a new file using the `touch` command (e.g., `touch my_file.txt`) or by using the `edit` addon (e.g., `edit my_file.txt` and then saving the file).

### Q: How do I see my command history?

**A:** Use the `history` command to see a list of all the commands you have entered.

### Q: How can I customize the terminal prompt?

**A:** The prompt can be customized by setting the `PS1` environment variable. For example: `export PS1="my-terminal> "`. Add this command to your `.bashrc` file to make the change permanent.
