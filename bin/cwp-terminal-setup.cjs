#!/usr/bin/env node

/**
 * CWP Open Terminal Emulator — Setup CLI (v5.1.4)
 * Modes:
 *   1. scaffold → generate full project (index.html, style.css, app.js, todo.md)
 *   2. refactor → inject terminal into existing files
 *   3. manual   → generate snippet with custom DOM mapping
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ---------------- Utility ----------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query, defaultValue) => {
  const q = `? ${query} (${defaultValue}) `;
  return new Promise(resolve =>
    rl.question(q, answer => resolve(answer.trim() || defaultValue))
  );
};

// ---------------- Templates ----------------
const generateHTML = (containerId, jsFileName) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CWP Open Terminal Emulator</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="${containerId}"></div>
  <script src="${jsFileName}" type="module"></script>
</body>
</html>`;

const defaultCSS = () => `
body {
  margin: 0;
  background: black;
  color: #0f0;
  font-family: "Courier New", monospace;
}
#terminal {
  width: 90%;
  height: 90vh;
  margin: auto;
  border: 2px solid #0f0;
  box-shadow: 0 0 20px rgba(0,255,0,0.4);
  background: black;
  overflow-y: auto;
}
`;

const defaultTODO = () => `
# TODO
- Open index.html in a browser
- Type 'help' in the terminal to see available commands
- Edit app.js to register addons or customize
`;

const generateJS = (containerId) => `
import { CentralTerminal, EditorAddon, RpsAddon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize the Terminal by passing in the ID of the container element
    const term = new CentralTerminal('#${containerId}');
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    await term.boot();

    term._print("\\nCWP Open Terminal Emulator v5.1.4");
    term._print("(c) 2025 ClockWorks Production Studio");
    term._print("Type 'help' to see available commands.\\n");
  } catch (error) {
    console.error("Failed to initialize terminal:", error);
    const container = document.querySelector('#${containerId}');
    if (container) {
      container.innerHTML = \\\`
        <div style="color: red; font-family: monospace; padding: 1em;">
          <h2>Error Initializing Terminal</h2>
          <p><strong>Error:</strong> \\\${error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      \\\`;
    }
  }
});
`;

const generateJSManual = (containerId, opts) => `
import { CentralTerminal } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const term = new CentralTerminal('${containerId}', {
      inputSelector: '${opts.input}',
      outputSelector: '${opts.output}',
      promptSelector: '${opts.prompt}'
    });
    await term.boot();
    term._print("\\nCWP Terminal (manual DOM mapping mode)\\n");
  } catch (error) {
    console.error("Failed to initialize terminal:", error);
  }
});
`;

// ---------------- Main CLI ----------------
async function main() {
  console.log(`
--------------------------------------------------
 CWP Open Terminal Emulator - Automated Setup
--------------------------------------------------
This script will help you create the necessary files to get started.
`);

  const channel = await askQuestion(
    "Which release channel do you want to use? (latest / lts / dev / nightly)",
    "latest"
  );

  const installCommand = `npm install @clockworksproduction-studio/cwp-open-terminal-emulator@${channel}`;

  console.log(`\nIt will create files in the current directory: \${process.cwd()}\n`);

  const mode = await askQuestion(
    "Setup mode? (scaffold / refactor / manual)",
    "scaffold"
  );

  // Mode 1: Scaffold
  if (mode === "scaffold") {
    const dir = path.join(process.cwd(), "terminal-demo");
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, "index.html"), generateHTML("terminal", "app.js"));
    fs.writeFileSync(path.join(dir, "style.css"), defaultCSS());
    fs.writeFileSync(path.join(dir, "app.js"), generateJS("terminal"));
    fs.writeFileSync(path.join(dir, "todo.md"), defaultTODO());

    console.log(`\n(Success) Created full terminal project at ./terminal-demo`);
  }

  // Mode 2: Refactor
  if (mode === "refactor") {
    const htmlPath = await askQuestion("Path to index.html", "index.html");
    const jsPath   = await askQuestion("Path to app.js", "app.js");
    const cssPath  = await askQuestion("Path to style.css", "style.css");

    // Patch HTML
    let html = fs.readFileSync(htmlPath, "utf8");
    if (!html.includes("central-terminal-container")) {
      html = html.replace(
        "</body>",
        `<div id="central-terminal-container"></div>\n<script src="app.js" type="module"></script>\n</body>`
      );
      fs.writeFileSync(htmlPath, html);
    }

    // Ensure CSS exists
    if (!fs.existsSync(cssPath)) {
      fs.writeFileSync(cssPath, defaultCSS());
    }

    // Overwrite JS
    fs.writeFileSync(jsPath, generateJS("central-terminal-container"));
    console.log(`\n(Success) Refactored existing files with terminal setup`);
  }

  // Mode 3: Manual DOM mapping
  if (mode === "manual") {
    const containerSel = await askQuestion("CSS selector for terminal container", "#terminal");
    const inputSel     = await askQuestion("Custom input selector (blank = auto)", "");
    const outputSel    = await askQuestion("Custom output selector (blank = auto)", "");
    const promptSel    = await askQuestion("Custom prompt selector (blank = auto)", "");

    const jsContent = generateJSManual(containerSel, {
      input: inputSel,
      output: outputSel,
      prompt: promptSel
    });
    fs.writeFileSync(path.join(process.cwd(), "app.js"), jsContent);

    console.log(`\n(Success) Generated app.js for manual DOM mapping.`);
  }

  console.log(`
--------------------------------------------------
 Setup Complete!
--------------------------------------------------
Next steps:
  1. If you haven't already, add the library by running:
     ${installCommand}

  2. Open index.html in your browser (or your existing project)
     to see your terminal in action!
`);

  rl.close();
}

// Export the main function for testing
module.exports = { main };

// Run the main function only if the script is executed directly
if (require.main === module) {
  main();
}
