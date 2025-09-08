#!/usr/bin/env node
/**
 * CWP Open Terminal Emulator — Unified Setup CLI v5.2.4
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const htmlTemplate = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CWP Open Terminal Emulator</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div id="pseudo-terminal">
  <div id="terminalOutput"></div>
  <div id="terminal-command">
    <span id="terminal-prompt">&gt;</span>
    <input type="text" id="terminal-command-input" autocomplete="off" />
  </div>
</div>
<script src="app.js" type="module"></script>
</body>
</html>`;

const cssTemplate = () => `body{margin:0;height:100vh;background-color:#000;color:#0f0;font-family:"Courier New",monospace;display:flex;justify-content:center;align-items:center;}
#pseudo-terminal{width:80%;max-width:1000px;height:80vh;background-color:#000;border:2px solid #0f0;box-shadow:0 0 20px rgba(0,255,0,0.5);display:flex;flex-direction:column;padding:1rem;overflow:hidden;position:relative;}
#terminalOutput{flex:1;overflow-y:auto;white-space:pre-wrap;line-height:1.3;padding-right:0.2rem;}
#terminalOutput::-webkit-scrollbar{width:8px;}#terminalOutput::-webkit-scrollbar-track{background:#000;}#terminalOutput::-webkit-scrollbar-thumb{background-color:#0f0;border-radius:4px;}
#terminal-command{display:flex;align-items:center;margin-top:0.3rem;}#terminal-prompt{margin-right:0.5rem;}
#terminal-command-input{background:transparent;border:none;outline:none;color:#0f0;font-family:inherit;font-size:1rem;flex:1;caret-color:#0f0;}
#terminal-command-input::after{content:'|';animation:blink 1s step-start infinite;}
@keyframes blink{50%{opacity:0;}}
#pseudo-terminal::before{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background-image:repeating-linear-gradient(0deg,rgba(0,255,0,0.05),rgba(0,255,0,0.05) 1px,transparent 1px,transparent 2px);pointer-events:none;}`;

const jsTemplate = (opts={}) => `import { CentralTerminal, EditorAddon, RpsAddon } from '@clockworksproduction-studio/cwp-open-terminal-emulator';
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const term = new CentralTerminal("${opts.container||'#pseudo-terminal'}", {
      inputSelector: "${opts.input||'#terminal-command-input'}",
      outputSelector: "${opts.output||'#terminalOutput'}",
      promptSelector: "${opts.prompt||'#terminal-prompt'}"
    });
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    await term.boot();
    term._print("\nCWP Open Terminal Emulator v5.2.4");
    term._print("(c) 2025 ClockWorks Production Studio");
    term._print("Type 'help' to see available commands.\n");
    const inputField=document.querySelector("${opts.input||'#terminal-command-input'}");if(inputField)inputField.focus();
    const output=document.querySelector("${opts.output||'#terminalOutput'}");
    if(output){const observer=new MutationObserver(()=>{output.scrollTop=output.scrollHeight;});observer.observe(output,{childList:true,subtree:true});}
  } catch(e){console.error("Failed to initialize terminal:",e);
    const container=document.querySelector("${opts.container||'#pseudo-terminal'}");
    if(container){container.innerHTML= '<div style="color:red;font-family:monospace;padding:1em;">' + '<h2>Error Initializing Terminal</h2><p><strong>Error:</strong> ' + e.message + '</p><p>Check console for details.</p></div>';}}});`;

const todoTemplate = () => `# TODO
- Run \`npm install @clockworksproduction-studio/cwp-open-terminal-emulator\`
- Open index.html
- Type 'help'
- Edit app.js to add custom commands or register addons
`;

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q, d) => new Promise(r => rl.question(`? ${q}${d ? ` (${d})` : ''} `, ans => r(ans.trim() || d)));

  const args = process.argv.slice(2);
  const isNew = args.includes('--new');
  const isRefactor = args.includes('--refactor');
  const isManual = args.includes('--manual');

  // --dir option
  const dirArgIndex = args.indexOf('--dir');
  let outDir = process.cwd();
  if (dirArgIndex > -1 && args[dirArgIndex + 1]) {
    outDir = path.resolve(process.cwd(), args[dirArgIndex + 1]);
  }

  if([isNew,isRefactor,isManual].filter(Boolean).length>1){
    console.error("Error: Use only one of --new, --refactor, or --manual"); process.exit(1);
  }

  // ---------------- NEW ----------------
  if(isNew){
    const dir = outDir || path.join(process.cwd(),'terminal-demo');
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'index.html'),htmlTemplate());
    fs.writeFileSync(path.join(dir,'style.css'),cssTemplate());
    fs.writeFileSync(path.join(dir,'app.js'),jsTemplate());
    fs.writeFileSync(path.join(dir,'todo.md'),todoTemplate());
    console.log(`[New] Full project generated at ${dir}`);
    rl.close(); return;
  }

  // ---------------- REFACTOR ----------------
  if(isRefactor){
    const htmlPath = await ask("Path to your HTML file","index.html");
    const jsPath = await ask("Path to your JS file","app.js");
    const container = await ask("CSS selector for terminal container","#pseudo-terminal");
    const output = await ask("CSS selector for output","#terminalOutput");
    const input = await ask("CSS selector for input","#terminal-command-input");
    const prompt = await ask("CSS selector for prompt","#terminal-prompt");

    if(fs.existsSync(htmlPath)){
      let html=fs.readFileSync(htmlPath,'utf8');
      if(!html.includes(container.replace('#','id="pseudo-terminal"'))){
        html=html.replace('</body>',`  <div id="${container.replace('#','')}"></div>\n</body>`);
        fs.writeFileSync(htmlPath,html);
        console.log(`[Refactor] Injected terminal div into ${htmlPath}`);
      }
    }
    fs.writeFileSync(jsPath,jsTemplate({container,output,input,prompt}));
    console.log(`[Refactor] Updated JS at ${jsPath}`);
    rl.close(); return;
  }

  // ---------------- MANUAL ----------------
  if(isManual){
    let containerSel = await ask("CSS selector for terminal container","#pseudo-terminal");
    let outputSel = await ask("CSS selector for output","#terminalOutput");
    let inputSel = await ask("CSS selector for input","#terminal-command-input");
    let promptSel = await ask("CSS selector for prompt","#terminal-prompt");

    const htmlPath = path.join(outDir,"index.html");
    let htmlModified = false;

    if(fs.existsSync(htmlPath)){
      let html = fs.readFileSync(htmlPath,'utf8');

      if(!html.includes(containerSel.replace('#','id="pseudo-terminal"'))){
        html = html.replace('</body>',`  <div id="${containerSel.replace('#','')}"></div>\n</body>`);
        htmlModified = true;
        console.log(`[Manual] Created container div ${containerSel} in index.html`);
      }

      const containerId = containerSel.replace('#','');
      const divRegex = new RegExp(`<div[^>]+id=["']${containerId}["'][^>]*>([\\\\s\\\\S]*?)<\\\\/div>`);
      const match = html.match(divRegex);
      if(match){
        let inner = match[1];
        if(!inner.includes(outputSel.replace('#','id="terminalOutput"'))){
          inner += `\n  <div id="terminalOutput"></div>`;
          htmlModified = true;
        }
        if(!inner.includes(inputSel.replace('#','id="terminal-command-input"')) || !inner.includes(promptSel.replace('#','id="terminal-prompt"'))){
          inner += `\n  <div id="terminal-command"><span id="terminal-prompt">&gt;</span><input type="text" id="terminal-command-input" autocomplete="off"/></div>`;
          htmlModified = true;
        }
        html = html.replace(divRegex, `<div id="${containerId}">${inner}\n</div>`);
      }

      if(htmlModified){
        fs.writeFileSync(htmlPath, html);
        console.log(`[Manual] Updated index.html to include missing elements`);
      }
    }

    const jsFile = path.join(outDir,"app.js");
    fs.writeFileSync(jsFile, jsTemplate({container:containerSel,output:outputSel,input:inputSel,prompt:promptSel}));
    console.log(`[Manual] Generated JS at ${jsFile}`);
    rl.close(); return;
  }

  // ---------------- INTERACTIVE FALLBACK ----------------
  console.log("No flags provided. Running interactive setup...");
  const mode = await ask("Select setup mode (new / refactor / manual)","new");
  const interactiveDir = await ask("Directory to generate files in", mode==="new" ? "terminal-demo" : process.cwd());

  if(mode==="new"){
    const dir = path.resolve(process.cwd(), interactiveDir);
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'index.html'),htmlTemplate());
    fs.writeFileSync(path.join(dir,'style.css'),cssTemplate());
    fs.writeFileSync(path.join(dir,'app.js'),jsTemplate());
    fs.writeFileSync(path.join(dir,'todo.md'),todoTemplate());
    console.log(`[Interactive] Full project generated at ${dir}`);
  } else if(mode==="manual"){
    let containerSel = await ask("CSS selector for terminal container","#pseudo-terminal");
    let outputSel = await ask("CSS selector for output","#terminalOutput");
    let inputSel = await ask("CSS selector for input","#terminal-command-input");
    let promptSel = await ask("CSS selector for prompt","#terminal-prompt");

    const htmlPath = path.join(path.resolve(process.cwd(),interactiveDir),"index.html");
    let htmlModified = false;

    if(fs.existsSync(htmlPath)){
      let html = fs.readFileSync(htmlPath,'utf8');
      if(!html.includes(containerSel.replace('#','id="pseudo-terminal"'))){
        html = html.replace('</body>',`  <div id="${containerSel.replace('#','')}"></div>\n</body>`);
        htmlModified = true;
        console.log(`[Manual] Created container div ${containerSel} in index.html`);
      }

      const containerId = containerSel.replace('#','');
      const divRegex = new RegExp(`<div[^>]+id=["']${containerId}["'][^>]*>([\\\\s\\\\S]*?)<\\\\/div>`);
      const match = html.match(divRegex);
      if(match){
        let inner = match[1];
        if(!inner.includes(outputSel.replace('#','id="terminalOutput"'))){
          inner += `\n  <div id="terminalOutput"></div>`;
          htmlModified = true;
        }
        if(!inner.includes(inputSel.replace('#','id="terminal-command-input"')) || !inner.includes(promptSel.replace('#','id="terminal-prompt"'))){
          inner += `\n  <div id="terminal-command"><span id="terminal-prompt">&gt;</span><input type="text" id="terminal-command-input" autocomplete="off"/></div>`;
          htmlModified = true;
        }
        html = html.replace(divRegex, `<div id="${containerId}">${inner}\n</div>`);
      }

      if(htmlModified){
        fs.writeFileSync(htmlPath, html);
        console.log(`[Manual] Updated index.html to include missing elements`);
      }
    }

    const jsFile = path.join(path.resolve(process.cwd(),interactiveDir),"app.js");
    fs.writeFileSync(jsFile, jsTemplate({container:containerSel,output:outputSel,input:inputSel,prompt:promptSel}));
    console.log(`[Manual] Generated JS at ${jsFile}`);
  } else if(mode==="refactor"){
    console.log("Interactive refactor not supported. Please use --refactor with flags.");
  }

  rl.close();
}

export { main };
