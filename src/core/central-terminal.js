import { AddonExecutor, BootCheck, BootCheckRegistry, BootHandler, TerminalUI, VDirectory, VFile, VOS } from '../index.js';

class CentralTerminal {
    constructor(containerOrUI, ...args) {
      this.version = '5.1.5';
  
      if (typeof containerOrUI === 'string') {
        this.ui = new TerminalUI(containerOrUI, this.runCommand.bind(this), this._autoComplete.bind(this), ...args);
      } else {
        this.ui = containerOrUI;
      }
  
      this.vOS = new VOS();
      this.commandHistory = [];
      this.historyIndex = -1;
      this.commands = {};
      // this.editor and this.rps are now obsolete and have been removed.
      this.addonExecutor = new AddonExecutor(this, this.vOS);
      this.bootRegistry = new BootCheckRegistry();
      this.customBootupText = null;
      this._registerDefaultCommands();
    }
  
    // --- Core Methods ---
    _print(text) { this.ui.appendTerminalOutput(text); }
    _biosWrite(text) { this.ui.appendTerminalOutput(text, false); }
    _biosWriteLine(text) { this.ui.appendTerminalOutput(text, true); }
    clear() { this.ui.clearTerminal(); }
    setBootupText(text) {
      this.customBootupText = text;
    }
  
    // --- Retro BASH-like prompt ---
    prompt() {
      if (this.addonExecutor.isActive()) {
        return `(${this.addonExecutor.activeAddon.name})> `;
      }
      const cwd = this.vOS.pathOf(this.vOS.cwd) || '/'; // <-- fallback to '/'
      return `<span class="prompt-user">user</span>@<span class="prompt-host">central</span> <span class="prompt-path">${cwd}</span>: $ `;
    }  
  
    _saveHistory() { localStorage.setItem('cterm_history', JSON.stringify(this.commandHistory)); }
    _saveState() { localStorage.setItem('cterm_vos', JSON.stringify(this.vOS.toJSON())); }
  
    // --- Addon Management ---
    registerAddon(addonInstance) { this.addonExecutor.register(addonInstance); }
    addCommand(cmd) { this.commands[cmd.name] = cmd; }
  
    // --- Main Command Runner (REPLACE THIS METHOD) ---
    async runCommand(rawInput) {
      const input = rawInput.trim();
      if (!input) {
          this.ui.setPrompt(this.prompt());
          return;
      }
  
      // Echo the command to the terminal output
      this.ui.appendTerminalOutput(`${this.prompt()}${input}`);
  
      // If an addon is active, pass the command to it and stop further processing.
      if (this.addonExecutor.handleCommand(input)) {
          this._saveState(); // Save state after addon command
          this.ui.setPrompt(this.prompt());
          return;
      }
  
      // Add to history for main terminal commands
      this.commandHistory.push(input);
      this._saveHistory();
  
      const parts = input.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      const name = parts.shift() || '';
      const args = parts.map(p => p.replace(/^["']|["']$/g, ''));
      const cmd = this.commands[name];
  
      if (!cmd) {
        this._print(`bash: ${name}: command not found`);
        this.ui.setPrompt(this.prompt());
        return;
      }
  
      try {
        await cmd.execute(args, this);
      } catch (err) {
        this._print(`Error running command: ${err}`);
        console.error(err);
      }
  
      this._saveState();
      this.ui.setPrompt(this.prompt());
    }
  
    // --- Boot Sequence ---
    async boot() {
      const bootHandler = new BootHandler(this);
  
      // Add default checks
      this.bootRegistry.add(new BootCheck('Loading saved session', () => {
        try {
          const vosData = localStorage.getItem('cterm_vos');
          if (vosData) this.vOS = VOS.fromJSON(JSON.parse(vosData));
          const historyData = localStorage.getItem('cterm_history');
          if (historyData) this.commandHistory = JSON.parse(historyData);
          return true;
        } catch (e) {
          console.error("Failed to load session:", e);
          return true; // Don't block boot on corrupted save
        }
      }));
      
      this.bootRegistry.add(new BootCheck('Verifying core components', async () => {
          await new Promise(r => setTimeout(r, 150)); // fake delay
          return typeof this.vOS !== 'undefined' && typeof this.addonExecutor !== 'undefined';
      }));
  
      this.bootRegistry.add(new BootCheck('Checking UI elements', async () => {
          await new Promise(r => setTimeout(r, 200)); // fake delay
          return this.ui && this.ui.input && this.ui.output;
      }));
  
      try {
          // Run the full animated boot sequence
          await bootHandler.run();
          
          // This code runs *after* the animation is complete
          this.clear(); // Clear bootup text from the actual terminal output
          const motd = this.vOS.readFile('/etc/motd');
          if (motd) this._print(motd);
          this.ui.setPrompt(this.prompt()); // Set initial prompt
          this.ui.input.focus();
  
      } catch (error) {
          console.error(error); // Log boot failure
          // The error message is already on the boot screen
      }
    }
  
    // ---------- Default Commands (REPLACE THIS METHOD) ----------
    _registerDefaultCommands() {
      const cmd = (name, desc, exec) => ({ name, desc, execute: exec });
  
      // --- Addon Aliases & Runner ---
      this.addCommand(cmd('run', 'run a registered addon', (args, term) => {
          const addonName = args.shift();
          if (!addonName) {
              term._print('usage: run <addon_name> [args...]');
              return;
          }
          term.addonExecutor.start(addonName, args);
      }));
      this.addCommand(cmd('edit', 'edit a file using the text editor addon', (args, term) => {
        term.addonExecutor.start('edit', args);
      }));
      this.addCommand(cmd('vim', 'alias for the edit command', (args, term) => {
          term.addonExecutor.start('edit', args);
      }));
      this.addCommand(cmd('rps', 'play rock-paper-scissors', (args, term) => {
        term.addonExecutor.start('rps', args);
      }));
    
  
      // --- Filesystem (with fixes) ---
      this.addCommand(cmd('ls', 'list files', (args, term) => {
        const files = term.vOS.ls(args[0] || '.');
        if (files === null) term._print(`ls: cannot access '${args[0] || '.'}'`);
        else if (files.length > 0) term._print(files.join('  '));
      }));
      this.addCommand(cmd('cd', 'change directory', (args, term) => {
          const target = args[0] || '~';
          if (!term.vOS.chdir(target)) {
              term._print(`cd: no such file or directory: ${target}`);
          }
      }));
      this.addCommand(cmd('pwd', 'print working directory', () => this._print(this.vOS.pathOf(this.vOS.cwd))));
      
      this.addCommand(cmd('mkdir', 'make directory', args => {
        const pathArg = args.filter(a => !a.startsWith('-')).pop();
        const pFlag = args.includes('-p');
        if (!pathArg) { this._print('usage: mkdir [-p] <dir>'); return; }
        
        const success = pFlag ? this.vOS._mkdirp(pathArg) : this.vOS.mkdir(pathArg);
        if (!success) this._print(`mkdir: cannot create directory '${pathArg}'`);
      }));
  
      this.addCommand(cmd('rmdir', 'remove empty directory', args => {
        if (!args[0]) this._print('usage: rmdir <dir>');
        else if (!this.vOS.rmdir(args[0])) this._print(`rmdir: failed to remove '${args[0]}'`);
      }));
      this.addCommand(cmd('rm', 'remove file', args => {
        if (!args[0]) this._print('usage: rm <file>');
        else if (!this.vOS.unlink(this.vOS.normalize(args[0]))) this._print(`rm: cannot remove '${args[0]}'`);
      }));
      this.addCommand(cmd('cp', 'copy file', args => {
        const [src, dest] = args;
        if (!src || !dest) { this._print('usage: cp <src> <dest>'); return; }
        const node = this.vOS.resolve(src);
        if (!(node instanceof VFile)) { this._print(`cp: cannot copy '${src}'`); return; }
        if (!this.vOS.writeFile(dest, node.content, node.ftype, true)) this._print(`cp: cannot write to '${dest}'`);
      }));
      this.addCommand(cmd('mv', 'move/rename file', args => {
        const [src, dest] = args;
        if (!src || !dest) { this._print('usage: mv <src> <dest>'); return; }
        const node = this.vOS.resolve(src);
        if (!node) { this._print(`mv: cannot stat '${src}'`); return; }
        const success = this.vOS.writeFile(dest, node.content || '', node.ftype, true);
        if (success && node.kind === 'file') {
            this.vOS.unlink(src);
        } else if (!success) {
            this._print(`mv: cannot move to '${dest}'`);
        }
      }));
      this.addCommand(cmd('touch', 'create empty file', args => {
        if (!args[0]) this._print('usage: touch <file>');
        else this.vOS.writeFile(args[0], '', 'text', false);
      }));
      this.addCommand(cmd('cat', 'print file contents', (args, term) => {
        const path = args[0];
        if (!path) {
          term._print('usage: cat <file>');
          return;
        }

        const node = term.vOS.resolve(path);

        if (!node) {
          term._print(`cat: ${path}: No such file or directory`);
          return;
        }

        if (node.kind === 'dir') {
          term._print(`cat: ${path}: Is a directory`);
          return;
        }

        // Handle linked files (images, audio, video)
        if (node.ftype === 'link') {
          const url = node.content;

          if (url.match(/\.(jpeg|jpg|gif|png|svg)$/i)) {
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '80%';
            img.style.display = 'block';
            img.onload = () => { term.ui.output.scrollTop = term.ui.output.scrollHeight; };
            term.ui.output.appendChild(img);
          } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
            const audio = document.createElement('audio');
            audio.src = url;
            audio.controls = true;
            audio.style.width = '80%';
            term.ui.output.appendChild(audio);
          } else if (url.match(/\.(mp4|webm)$/i)) {
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.style.maxWidth = '80%';
            term.ui.output.appendChild(video);
          } else {
            term._print(`Link to resource: ${url}`);
          }
        } else {
          // Handle regular text files
          term._print(node.content);
        }
      }));

  
      this.addCommand(cmd('head', 'first N lines of a file', args => {
          const f = args[0]; const n = parseInt(args[1] || '10', 10);
          if (!f) { this._print('usage: head <file> [lines]'); return; }
          const node = this.vOS.resolve(f);
          if (!node || !(node instanceof VFile)) { this._print(`head: cannot open '${f}'`); return; }
          this._print(node.content.split('\n').slice(0, n).join('\n'));
      }));
  
      this.addCommand(cmd('tail', 'last N lines of a file', args => {
          const f = args[0]; const n = parseInt(args[1] || '10', 10);
          if (!f) { this._print('usage: tail <file> [lines]'); return; }
          const node = this.vOS.resolve(f);
          if (!node || !(node instanceof VFile)) { this._print(`tail: cannot open '${f}'`); return; }
          this._print(node.content.split('\n').slice(-n).join('\n'));
      }));
  
      this.addCommand(cmd('tree', 'show directory tree', args => {
        const dir = this.vOS.resolve(args[0] || '.');
        if (!(dir instanceof VDirectory)) { this._print(`tree: ${args[0]}: No such directory`); return; }
        this._print(dir.name || '/');
        this._tree(dir, '');
      }));
      
      this.addCommand(cmd('grep', 'search pattern in file', args => {
        const [p, f] = args; if (!p || !f) { this._print('usage: grep <pattern> <file>'); return; }
        const node = this.vOS.resolve(f); if (!node || !(node instanceof VFile)) { this._print(`grep: ${f}: No such file`); return; }
        try {
          const re = new RegExp(p, 'g');
          const matches = node.content.split('\n').filter(l => l.match(re));
          if (matches.length > 0) this._print(matches.join('\n'));
        } catch (e) {
          this._print(`grep: invalid pattern: ${e.message}`);
        }
      }));
  
      // --- Mock FS Commands ---
      this.addCommand(cmd('ln', 'create symbolic link (mock)', () => this._print('ln: symbolic links not implemented')));
      this.addCommand(cmd('find', 'find files/directories (mock)', () => this._print('find: not implemented')));
      this.addCommand(cmd('chmod', 'change file permissions (mock)', () => this._print('chmod: permission change simulated')));
      this.addCommand(cmd('chown', 'change file owner (mock)', () => this._print('chown: ownership simulated')));
      this.addCommand(cmd('chgrp', 'change group (mock)', () => this._print('chgrp: group change simulated')));
      this.addCommand(cmd('umask', 'show umask', () => this._print('022')));
  
      // --- Process / System (Mocks) ---
      this.addCommand(cmd('ps', 'list processes (mock)', () => this._print('PID TTY TIME CMD\n1 pts/0 00:00 bash')));
      this.addCommand(cmd('top', 'process monitor (mock)', () => this._print('Top: simulated')));
      this.addCommand(cmd('kill', 'kill process (mock)', () => this._print('kill: simulated')));
      this.addCommand(cmd('pkill', 'kill by name (mock)', () => this._print('pkill: simulated')));
      this.addCommand(cmd('pgrep', 'find process by name (mock)', () => this._print('pgrep: simulated')));
      
      // --- System Info ---
      this.addCommand(cmd('uname', 'system information', () => this._print(`CentralTerminal OS v${this.version}`)));
      this.addCommand(cmd('whoami', 'current user', () => this._print('user')));
      this.addCommand(cmd('df', 'disk usage (mock)', () => this._print('/dev/vfs 1024M 512M 512M 50% /')));
      this.addCommand(cmd('du', 'directory usage (mock)', () => this._print('4K\t./docs\n8K\t./home/user')));
      this.addCommand(cmd('free', 'memory info (mock)', () => this._print('Mem: 1024MB total, 512MB used, 512MB free')));
      this.addCommand(cmd('uptime', 'system uptime (mock)', () => this._print('up 1 day, 4:20')));
      
      // --- Utilities ---
      this.addCommand(cmd('echo', 'echo arguments', args => this._print(args.join(' '))));
      this.addCommand(cmd('history', 'command history', () => this.commandHistory.forEach((h,i)=>this._print(`${String(i+1).padStart(3, ' ')}  ${h}`))));
      this.addCommand(cmd('hclear', 'clear command history', (args, term) => {
          term.commandHistory = [];
          term._saveHistory();
          term._print('Command history cleared.');
      }));
      this.addCommand(cmd('date', 'current date/time', () => this._print(new Date().toString())));
      this.addCommand(cmd('clear', 'clear terminal screen', () => this.clear()));
      this.addCommand(cmd('exit', 'exit terminal', () => this._print('Exiting terminal...')));
      this.addCommand(cmd('ping', 'ping host (mock)', args => this._print(`PING ${args[0] || 'localhost'}: 32 bytes`)));
      this.addCommand(cmd('curl', 'fetch URL (mock)', args => this._print(`curl: fetched ${args[0] || 'http://example.com'}`)));
      this.addCommand(cmd('help', 'show help', () => {
          this._print('Available commands:\n');
          const longest = Math.max(...Object.keys(this.commands).map(n => n.length));
          Object.values(this.commands)
            .sort((a,b) => a.name.localeCompare(b.name))
            .forEach(c => this._print(`${c.name.padEnd(longest)} - ${c.desc}`));
      }));
  
      // --- Fun / Visual (Async) ---
      this.addCommand(cmd('aafire', 'ASCII fire animation', async (args, term) => {
          term._print('Starting ASCII fire... Press Ctrl+C to stop.');
          let running = true;
          const stop = () => { running = false; };
          term.ui.registerCtrlC(stop);
          const frames = ["( ) ( )", "(   ) (   )", ") ( ) (", "(   ) (   )"];
          while(running) {
              for (const frame of frames) {
                  if (!running) break;
                  // We create a new div for each frame to avoid clearing the screen
                  const frameDiv = document.createElement('div');
                  frameDiv.textContent = frame;
                  term.ui.output.appendChild(frameDiv);
                  term.ui.output.scrollTop = term.ui.output.scrollHeight;
                  await new Promise(r => setTimeout(r, 200));
              }
          }
          term._print('ASCII fire stopped.');
          term.ui.registerCtrlC(null); // Unregister the handler
      }));
      this.addCommand(cmd('cmatrix', 'Matrix-style falling text', async (args, term) => {
          term._print('Starting Matrix... Press Ctrl+C to stop.');
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
          let running = true;
          const stop = () => { running = false; };
          term.ui.registerCtrlC(stop); // Register handler
          while(running) {
              const line = Array.from({length: 80}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
              term._print(`<span style="color: #0f0;">${line}</span>`);
              await new Promise(r => setTimeout(r, 100));
          }
          term._print('Matrix stopped.');
          term.ui.registerCtrlC(null); // Unregister handler
      }));
    }
  
    // Helper for the 'tree' command
    _tree(dir, prefix) {
      const entries = Object.values(dir.children).sort((a, b) => a.name.localeCompare(b.name));
      entries.forEach((child, idx) => {
        const last = idx === entries.length - 1;
        const branch = last ? '└── ' : '├── ';
        const nextPref = prefix + (last ? '    ' : '│   ');
        this._print(prefix + branch + child.name + (child.kind === 'dir' ? '/' : ''));
        if (child instanceof VDirectory) this._tree(child, nextPref);
      });
    }
  
  
    // --- Autocomplete ---
    _autoComplete() {
      if (!this.ui || !this.ui.input) return;
      // Implementation remains the same as your version...
      const text = this.ui.input.value;
      if (!text.trim()) return;
      const parts = text.match(/(?:[^\\s\\"']+|'[^']*'|\\"[^\\"]*\\")+/g) || [];
      const last = parts[parts.length - 1] || '';
      const isPathy = last.startsWith('/') || last.startsWith('.') || last.startsWith('~');
  
      if (parts.length === 1 && !isPathy) {
        const all = Object.keys(this.commands);
        const matches = all.filter(n => n.startsWith(last));
        if (matches.length === 1) this.ui.input.value = matches[0] + ' ';
        else if (matches.length > 1) this._print(matches.join('  '));
        return;
      }
  
      const before = parts.slice(0, -1).join(' ');
      const path = last;
      let norm;
      try { norm = this.vOS.normalize(path); } catch { norm = path; }
      const dirPath = norm.endsWith('/') ? norm : (norm.lastIndexOf('/') >= 0 ? norm.slice(0, norm.lastIndexOf('/') + 1) : '/');
      const base = norm.slice(dirPath.length);
      const dir = this.vOS.resolve(dirPath || '.');
      if (!(dir instanceof VDirectory)) return;
      const ents = Object.keys(dir.children).filter(n => n.startsWith(base));
      if (ents.length === 1) {
        const comp = (dirPath === '/' && ents[0].startsWith('/') ? '' : dirPath) + ents[0];
        const node = dir.children[ents[0]];
        const suffix = node instanceof VDirectory ? '/' : ' ';
        this.ui.input.value = (before ? before + ' ' : '') + comp + suffix;
      } else if (ents.length > 1) this._print(ents.join('  '));
    }
}

export { CentralTerminal };
