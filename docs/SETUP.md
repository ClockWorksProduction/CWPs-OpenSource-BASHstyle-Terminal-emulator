# Setup Guide: CWP Open Terminal Emulator

This guide covers the different ways to install and configure the CWP Open Terminal Emulator in your web project.

---

## Automated Setup (Recommended)

For the fastest and easiest setup, use the automated CLI tool. This interactive script can generate a complete, ready-to-run project or integrate the terminal into your existing files.

Simply run the following command in your terminal and follow the prompts:

```bash
npx @clockworksproduction-studio/cwp-terminal-setup
```

The script offers three modes:

1.  **`scaffold`**: Creates a new `terminal-demo` directory with all the necessary HTML, CSS, and JavaScript files. This is the best option for new users or for creating a clean test environment.
2.  **`refactor`**: Injects the terminal into your existing project by asking for the paths to your HTML, CSS, and JS files.
3.  **`manual`**: Generates a JavaScript snippet with custom DOM selectors, giving you full control over where the terminal components are rendered.

After the script finishes, your terminal will be ready to go.

---

## Manual Setup

For users who prefer a hands-on approach or need a more customized integration, we provide a complete, step-by-step guide with ready-to-use code templates.

This guide contains everything you need to get started, including the HTML, CSS, and JavaScript templates.

- **[Detailed Manual Setup Guide](./manual-setup-guide.md)**

---

## Advanced Setup: Modular Configuration

For developers who want to separate their configuration into individual files (e.g., for BIOS text, the file system, or welcome messages), we provide a guide on how to load these components dynamically.

- **[Advanced Setup: Modular Configuration](./advanced-setup.md)**

---

## Next Steps

Once your terminal is running, what's next?

*   Type `help` in the terminal to see a list of default commands.
*   Explore how to create your own [custom addons](./addons.md).
*   Review the [full API reference](./api-reference.md) for advanced usage.
*   Consult the [troubleshooting guide](./troubleshooting.md) if you run into issues.

Happy coding!
