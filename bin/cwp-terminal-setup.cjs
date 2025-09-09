#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Require templates
const htmlTemplate = require(path.join(__dirname, './templates/html.cjs'));
const cssTemplate = require(path.join(__dirname, './templates/css.cjs'));
const jsTemplate = require(path.join(__dirname, './templates/js.cjs'));
const todoTemplate = require(path.join(__dirname, './templates/todo.cjs'));


// Helper to write a file
function writeFile(dir, file, content) {
  const filePath = path.join(dir, file);
  fs.writeFileSync(filePath, content, 'utf8');
}

// Helper to create a directory if it doesn't exist
function mkdirIfMissing(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Helper for interactive input
async function ask(question, defaultValue) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(resolve => rl.question(`${question}${defaultValue ? ` (${defaultValue})` : ''}: `, ans => resolve(ans.trim() || defaultValue)));
  rl.close();
  return answer;
}

// Main setup function
async function main(args) {
  const isNew = args.includes('--new');
  const isManual = args.includes('--manual');
  const isRefactor = args.includes('--refactor');

  // Check multiple flags
  if ([isNew, isManual, isRefactor].filter(Boolean).length > 1) {
    console.error("Error: Use only one of --new, --refactor, or --manual");
    process.exit(1);
  }

  // Determine base directory
  let baseDir;
  const dirFlagIndex = args.indexOf('--dir');
  if (dirFlagIndex !== -1 && args[dirFlagIndex + 1]) {
    baseDir = path.resolve(args[dirFlagIndex + 1]);
  } else {
    // Interactive prompt if not provided
    baseDir = await ask('Enter base directory', process.cwd());
  }

  mkdirIfMissing(baseDir);

  // --new: create full project
  if (isNew) {
    writeFile(baseDir, 'index.html', htmlTemplate());
    writeFile(baseDir, 'style.css', cssTemplate());
    writeFile(baseDir, 'app.js', jsTemplate());
    writeFile(baseDir, 'TODO.md', todoTemplate());
    console.log(`[New] Full project generated at ${baseDir}`);
    return;
  }

  // --manual: generate JS only
  if (isManual) {
    writeFile(baseDir, 'app.js', jsTemplate());
    console.log(`[Manual] Generated JS at ${baseDir}/app.js`);
    return;
  }

  // --refactor: update JS and inject terminal div if missing
  if (isRefactor) {
    const indexPath = path.join(baseDir, 'index.html');
    const jsPath = path.join(baseDir, 'app.js');

    if (!fs.existsSync(indexPath) || !fs.existsSync(jsPath)) {
      console.error(`[Refactor] index.html or app.js missing in ${baseDir}`);
      process.exit(1);
    }

    // Read and inject terminal div if missing
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    if (!indexContent.includes('<div id="pseudo-terminal">')) {
      const bodyClose = indexContent.lastIndexOf('</body>');
      if (bodyClose !== -1) {
        indexContent = indexContent.slice(0, bodyClose) + `
<div id="pseudo-terminal">
  <div id="terminalOutput"></div>
  <div id="terminal-command">
    <span id="terminal-prompt">&gt;</span>
    <input type="text" id="terminal-command-input" autocomplete="off" />
  </div>
</div>
` + indexContent.slice(bodyClose);
      }
      fs.writeFileSync(indexPath, indexContent, 'utf8');
      console.log(`[Refactor] Injected terminal div into ${indexPath}`);
    }

    // Overwrite JS
    fs.writeFileSync(jsPath, jsTemplate(), 'utf8');
    console.log(`[Refactor] Updated JS at ${jsPath}`);
    return;
  }

  // No flags: interactive setup
  console.log('No flags provided. Running interactive setup...');
  console.log('Use --new, --manual, or --refactor with --dir <path>');
}

module.exports = { main };

// Auto-run if script called directly
if (require.main === module) {
  main(process.argv.slice(2));
}
