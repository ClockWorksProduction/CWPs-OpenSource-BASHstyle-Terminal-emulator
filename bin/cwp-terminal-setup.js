#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query, defaultValue) => {
  const q = `? ${query} (${defaultValue}) `;
  return new Promise(resolve => rl.question(q, answer => {
    resolve(answer.trim() || defaultValue);
  }));
};

const generateHTML = (containerId, jsFileName) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CWP Open Terminal Emulator</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #1a1a1a;
    }
    #${containerId} {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="${containerId}"></div>
  <script src="${jsFileName}" type="module"></script>
</body>
</html>`;

const generateJS = (containerId) => ```
import { CentralTerminal } from '@clockworksproduction-studio/cwp-open-terminal-emulator';

document.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Initialize the Terminal by passing in the ID of the container element
    const term = new CentralTerminal('#${containerId}');

    // 2. Boot the terminal to make it visible and operational
    term.boot();

  } catch (error) {
    console.error("Failed to initialize terminal:", error);
    const container = document.querySelector('#${containerId}');
    if (container) {
      container.innerHTML = ``
        <div style="color: red; font-family: monospace; padding: 1em;">
          <h2>Error Initializing Terminal</h2>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      ``;
    }
  }
});
```;

async function main() {
  console.log(`
--------------------------------------------------
 CWP Open Terminal Emulator - Automated Setup
--------------------------------------------------
This script will help you create the necessary files to get started.
It will create files in the current directory: ${process.cwd()}
`);

  const containerId = await askQuestion('HTML element ID for the terminal', 'central-terminal-container');
  const jsFileName = await askQuestion('Name for your JavaScript file', 'app.js');
  const createHtml = await askQuestion('Create a basic index.html file?', 'yes');

  const jsContent = generateJS(containerId);
  const jsFilePath = path.join(process.cwd(), jsFileName);

  try {
    fs.writeFileSync(jsFilePath, jsContent.trim());
    console.log(`\\n(Success) Successfully created ${jsFileName}`);
  } catch (error) {
    console.error(`\\n(Error) Error creating ${jsFileName}:`, error);
    rl.close();
    return;
  }

  if (createHtml.toLowerCase() === 'yes' || createHtml.toLowerCase() === 'y') {
    const htmlContent = generateHTML(containerId, jsFileName);
    const htmlFilePath = path.join(process.cwd(), 'index.html');
    try {
      fs.writeFileSync(htmlFilePath, htmlContent);
      console.log(`(Success) Successfully created index.html`);
    } catch (error) {
      console.error(`\\n(Error) Error creating index.html:`, error);
      rl.close();
      return;
    }
  }

  console.log(`
--------------------------------------------------
 Setup Complete!
--------------------------------------------------
Next steps:
  1. If you haven't already, add the library to your project:
     npm install @clockworksproduction-studio/cwp-open-terminal-emulator

  2. Open index.html in your browser to see your new terminal!
`);

  rl.close();
}

main();
