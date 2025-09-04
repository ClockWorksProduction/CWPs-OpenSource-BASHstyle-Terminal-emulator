// ==========================
// CentralTerminal v5.0.0 — Client-only, BASH-like web terminal emulator
// - POSIX pathing throughout
// - Better realism: timestamps, overwrite flags, unixy errors
// - Interactivity: autocomplete, history nav, Ctrl+C, prompt
// - Persistence: localStorage for VFS + history + cwd
// - Safe: client-side only; simulated network
// ==========================

// ---------- Utility ----------
const nowISO = () => new Date().toISOString();
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// ---------- Virtual FS ----------
class VFile {
  constructor(name, content = '', ftype = 'text', mode = 0o644) {
    this.kind = 'file';
    this.name = name;
    this.content = content;
    this.ftype = ftype; // text | image | audio | exe
    this.mode = mode;   // unix-like permissions (not enforced, informational)
    this.ctime = nowISO();
    this.mtime = this.ctime;
  }
}

class VDirectory {
  constructor(name) {
    this.kind = 'dir';
    this.name = name;
    this.children = {}; // name -> VFile | VDirectory
  }
  getChild(name) { return this.children[name]; }
}

class VOS {
  constructor() {
    this.root = new VDirectory(''); // represents '/'
    this.homePath = '/home/user';
    this.cwd = this._mkdirp(this.homePath);
    this._seed();
  }

  // --- serialization ---
  toJSON() {
    const encode = (node) => {
      if (node.kind === 'dir') {
        const out = { kind: 'dir', name: node.name, children: {} };
        for (const [k, v] of Object.entries(node.children)) out.children[k] = encode(v);
        return out;
      }
      return deepClone({
        kind: 'file', name: node.name, content: node.content, ftype: node.ftype,
        mode: node.mode, ctime: node.ctime, mtime: node.mtime,
      });
    };
    return { root: encode(this.root), cwd: this.pathOf(this.cwd), homePath: this.homePath };
  }

  static fromJSON(json) {
    const decode = (obj) => {
      if (obj.kind === 'dir') {
        const d = new VDirectory(obj.name);
        for (const [k, v] of Object.entries(obj.children || {})) d.children[k] = decode(v);
        return d;
      }
      const f = new VFile(obj.name, obj.content, obj.ftype, obj.mode);
      f.ctime = obj.ctime; f.mtime = obj.mtime; return f;
    };
    const vos = new VOS();
    vos.root = decode(json.root);
    vos.cwd = vos.resolve(json.cwd) || vos._mkdirp('/home/user');
    vos.homePath = json.homePath || '/home/user';
    return vos;
  }

  // --- helpers ---
  _seed() {
    this.mkdir('/home');
    this.mkdir('/home/user');
    this.mkdir('/bin');
    this.mkdir('/etc');
    this.mkdir('/docs');
    this.mkdir('/media');
    this.mkdir('/media/images');
    this.mkdir('/media/audio');
    this.writeFile('/etc/motd', 'Welcome to the Central Terminal!\n\nHave a great day!');
    const demo = `# Welcome to the Virtual File System!\n\nUse commands: ls, cd, cat, tree.\nEnjoy!\n`;
    this.writeFile('/docs/guide.txt', demo);
  }

  // Normalize path, POSIX-like. Supports '.', '..', absolute and relative.
  normalize(path) {
    if (!path || path === '') return this.pathOf(this.cwd);
    if (path.startsWith('~')) path = path.replace('~', this.homePath);
    const abs = path.startsWith('/') ? path : this.pathOf(this.cwd) + '/' + path;
    const parts = abs.split('/');
    const stack = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') stack.pop(); else stack.push(part);
    }
    return '/' + stack.join('/');
  }

  resolve(path) {
    const norm = this.normalize(path);
    if (norm === '/') return this.root;
    const segs = norm.split('/').filter(Boolean);
    let cur = this.root;
    for (const s of segs) {
      if (!(cur instanceof VDirectory)) return null;
      cur = cur.children[s];
      if (!cur) return null;
    }
    return cur;
  }

  parentOf(path) {
    const norm = this.normalize(path);
    if (norm === '/') return null;
    const up = norm.slice(0, norm.lastIndexOf('/')) || '/';
    return this.resolve(up);
  }

  pathOf(node) {
    // BFS up from root
    const path = [];
    const dfs = (cur, target, acc) => {
      if (cur === target) { path.push(...acc); return true; }
      if (cur.kind !== 'dir') return false;
      for (const [name, child] of Object.entries(cur.children)) {
        if (dfs(child, target, [...acc, name])) return true;
      }
      return false;
    };
    if (node === this.root) return '/';
    dfs(this.root, node, []);
    return '/' + path.join('/');
  }

  // --- FS ops ---
  _mkdirp(path) {
    const norm = this.normalize(path);
    if (norm === '/') return this.root;
    const segs = norm.split('/').filter(Boolean);
    let cur = this.root;
    for (const s of segs) {
      if (!cur.children[s]) cur.children[s] = new VDirectory(s);
      cur = cur.children[s];
      if (!(cur instanceof VDirectory)) throw new Error('ENOTDIR: not a directory, ' + s);
    }
    return cur;
  }

  mkdir(path) {
    const parent = this.parentOf(path);
    if (!(parent instanceof VDirectory)) return false;
    const name = this.normalize(path).split('/').filter(Boolean).pop();
    if (parent.children[name]) return false; // EEXIST
    parent.children[name] = new VDirectory(name);
    return true;
  }

  rmdir(path) {
    const dir = this.resolve(path);
    if (!(dir instanceof VDirectory)) return false;
    if (Object.keys(dir.children).length) return false; // ENOTEMPTY
    const parent = this.parentOf(path);
    if (!parent) return false;
    delete parent.children[dir.name];
    return true;
  }

  writeFile(path, content = '', ftype = 'text', overwrite = true) {
    const parent = this.parentOf(path);
    if (!(parent instanceof VDirectory)) return false;
    const name = this.normalize(path).split('/').filter(Boolean).pop();
    const exists = parent.children[name];
    if (exists) {
      if (!(exists instanceof VFile)) return false; // EISDIR
      if (!overwrite) return false; // EEXIST
      exists.content = content;
      exists.mtime = nowISO();
      exists.ftype = ftype;
      return true;
    }
    parent.children[name] = new VFile(name, content, ftype);
    return true;
  }

  readFile(path) {
    const node = this.resolve(path);
    if (node instanceof VFile) return node.content;
    return null;
  }

  unlink(path) {
    const parent = this.parentOf(path);
    const node = this.resolve(path);
    if (!(parent instanceof VDirectory) || !(node instanceof VFile)) return false;
    delete parent.children[node.name];
    return true;
  }

  ls(path = '.') {
    const dir = this.resolve(path);
    if (!(dir instanceof VDirectory)) return null;
    return Object.values(dir.children).map((child) => {
      if (child.kind === 'dir') return child.name + '/';
      if (child.ftype === 'exe') return child.name + '*';
      return child.name;
    }).sort();
  }

  chdir(path) {
    const dir = this.resolve(path);
    if (dir instanceof VDirectory) { this.cwd = dir; return true; }
    return false;
  }
}

// ---------- Boot Checks ----------
class BootCheck { constructor(name, fn, description = '') { this.name = name; this.fn = fn; this.description = description; } }
class BootCheckRegistry {
  constructor() { this.checks = []; }
  add(check) { this.checks.push(check); }
  async run(term) {
    let ok = true;
    for (const c of this.checks) {
      term._biosWrite(`Running: ${c.name}... `);
      try {
        const passed = await c.fn();
        term._biosWriteLine(passed ? '<span class="status-ok">OK</span>' : '<span class="status-failed">FAILED</span>');
        if (!passed) ok = false;
      } catch {
        term._biosWriteLine('<span class="status-failed">FAILED</span>'); ok = false;
      }
    }
    return ok;
  }
}

// ---------- Addons ----------
class Addon {
  constructor(name) { this.name = name; this.term = null; this.vOS = null; }
  onStart(term, vOS, ...args) { this.term = term; this.vOS = vOS; this.args = args; term.print(`[${this.name}] started.`); }
  onCommand(input) { this.term.print(`[${this.name}]> ${input}`); }
  onStop() { if (this.term) this.term.print(`[${this.name}] stopped.`); }
}

class AddonExecutor {
  constructor() { this.addons = {}; this.active = null; }
  register(addon) { this.addons[addon.name.toLowerCase()] = addon; }
  start(name, term, vOS, ...args) {
    if (this.active) { term.print("addon: another addon is running (use 'exit' or Ctrl+C)"); return; }
    const a = this.addons[name.toLowerCase()];
    if (!a) { term.print(`addon: not found: ${name}`); return; }
    term.printHtml('<p style="color:yellow">This addon runs in-browser. Install trusted addons only.</p>');
    this.active = a; a.onStart(term, vOS, ...args);
  }
  stop(term) { if (this.active) { this.active.onStop(); this.active = null; if (term) term.print('Returned to main terminal.'); } }
  handle(input) { if (this.active) this.active.onCommand(input); }
}

// ---------- Main Terminal ----------
export class CentralTerminal {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) { console.error(`Container ${containerSelector} not found`); return; }

    // expected DOM structure inside container
    this.output = this.container.querySelector('#terminalOutput');
    this.input = this.container.querySelector('#terminal-command-input');
    this.biosScreen = document.getElementById('bios-screen');
    this.biosOutput = document.getElementById('bios-output');
    this.pseudoTerminal = document.getElementById('pseudo-terminal');

    this.vOS = this._loadState() || new VOS();
    this.bootChecks = new BootCheckRegistry();
    this.addons = new AddonExecutor();
    this.commands = {};

    this.username = 'user';
    this.hostname = 'central-terminal';

    this.commandHistory = this._loadHistory();
    this.historyIndex = null; // for arrow navigation

    this.editor = { isActive: false, lines: [], filePath: null, dirty: false };
    this.rps = { isActive: false, player: 0, cpu: 0, rounds: 0 };

    this._registerDefaultCommands();
    this._wireKeyboard();
  }

  // ------- Boot -------
  async boot() {
    this._biosClear();
    this._biosWriteLine('<p>CWP Open Terminal Emulator</p><p>© 2025 ClockWorks Production</p><p>&nbsp;</p>');
    const allOk = await this.bootChecks.run(this);
    this._biosWriteLine('&nbsp;');
    if (allOk) {
      this._biosWriteLine('<p>Booting complete.</p>');
      setTimeout(() => {
        this.biosScreen.style.display = 'none';
        this.pseudoTerminal.style.display = 'flex';
        this.print(this._motd());
        this.print("Type 'help' to see commands.");
      }, 400);
    } else {
      this._biosWriteLine('<p class="status-failed">Boot failed. Please check the system.</p>');
    }
  }

  addBootCheck(obj) { this.bootChecks.add(new BootCheck(obj.name, obj.check, obj.description)); }
  registerAddon(addon) { this.addons.register(addon); }
  addCommand(cmd) { this.commands[cmd.name] = cmd; (cmd.aliases||[]).forEach(a => this.commands[a] = cmd); }

  // ------- Rendering -------
  _sanitizeHtml(html) {
    const allowedTags = ['p','b','i','u','em','strong','pre','code','span','div','img','audio'];
    const allowedAttrs = ['style','src','alt','controls'];
    const el = document.createElement('div'); el.innerHTML = html;
    el.querySelectorAll('*').forEach(node => {
      if (!allowedTags.includes(node.tagName.toLowerCase())) { node.remove(); return; }
      for (const attr of [...node.attributes]) if (!allowedAttrs.includes(attr.name.toLowerCase())) node.removeAttribute(attr.name);
    });
    return el.innerHTML;
  }
  _scroll() { this.output.scrollTop = this.output.scrollHeight; }
  print(text = '') { const p = document.createElement('p'); p.textContent = text; this.output.appendChild(p); this._scroll(); }
  printHtml(html) { const d = document.createElement('div'); d.innerHTML = this._sanitizeHtml(html); this.output.appendChild(d); this._scroll(); }
  clear() { this.output.innerHTML = ''; }
  prompt() {
    const cwd = this.vOS.pathOf(this.vOS.cwd);
    const home = this.vOS.homePath;
    const display = cwd.startsWith(home) ? '~' + cwd.slice(home.length) : cwd;
    return `${this.username}@${this.hostname}:${display}$`;
  }
  _motd() {
    const motd = this.vOS.readFile('/etc/motd');
    return motd ? motd : 'Welcome.';
  }

  // ------- BIOS helpers -------
  _biosClear(){ if (this.biosOutput) this.biosOutput.innerHTML=''; }
  _biosWrite(html){ if (this.biosOutput) this.biosOutput.innerHTML += html; }
  _biosWriteLine(html){ if (this.biosOutput) this._biosWrite(`<p>${html}</p>`); }

  // ------- Keyboard wiring -------
  _wireKeyboard() {
    if (!this.input) return;
    this.input.addEventListener('keydown', (e) => {
      // Ctrl+C handling
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        this.print('^C');
        if (this.editor.isActive) this._editorStop();
        else if (this.rps.isActive) this._rpsStop();
        else if (this.addons.active) this.addons.stop(this);
        return;
      }
      // history nav
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.commandHistory.length === 0) return;
        if (this.historyIndex === null) this.historyIndex = this.commandHistory.length;
        if (e.key === 'ArrowUp') this.historyIndex = Math.max(0, this.historyIndex - 1);
        else this.historyIndex = Math.min(this.commandHistory.length, this.historyIndex + 1);
        this.input.value = this.historyIndex === this.commandHistory.length ? '' : this.commandHistory[this.historyIndex];
        return;
      }
      // autocomplete
      if (e.key === 'Tab') {
        e.preventDefault();
        this._autoComplete();
        return;
      }
      // run on Enter
      if (e.key === 'Enter') {
        const cmd = this.input.value;
        this.input.value = '';
        this.historyIndex = null;
        this.runCommand(cmd);
      }
    });
  }

  // ------- Persistence -------
  _saveState() {
    try {
      localStorage.setItem('central.vfs', JSON.stringify(this.vOS.toJSON()));
      localStorage.setItem('central.cwd', this.vOS.pathOf(this.vOS.cwd));
    } catch {}
  }
  _loadState() {
    try {
      const raw = localStorage.getItem('central.vfs');
      const cwd = localStorage.getItem('central.cwd');
      if (!raw) return null;
      const vos = VOS.fromJSON(JSON.parse(raw));
      if (cwd) vos.chdir(cwd);
      return vos;
    } catch { return null; }
  }
  _saveHistory(){ try { localStorage.setItem('central.hist', JSON.stringify(this.commandHistory)); } catch {} }
  _loadHistory(){ try { return JSON.parse(localStorage.getItem('central.hist')||'[]'); } catch { return []; } }

  // ------- Command system -------
  _registerDefaultCommands() {
    const cmd = (name, description, execute, aliases=[]) => ({ name, description, execute, aliases });
    const unixErr = (msg) => `bash: ${msg}`;

    this.addCommand(cmd('pwd', 'print working directory', () => this.print(this.vOS.pathOf(this.vOS.cwd))));

    this.addCommand(cmd('ls', 'list directory contents', (args) => {
      const path = args[0] || '.';
      const list = this.vOS.ls(path);
      if (!list) { this.print(unixErr(`ls: cannot access '${path}': No such file or directory`)); return; }
      this.print(list.join('\n'));
    }));

    this.addCommand(cmd('cd', 'change directory', (args) => {
      const path = args[0] || this.vOS.homePath;
      if (!this.vOS.chdir(path)) this.print(unixErr(`cd: ${path}: No such file or directory`));
      this._saveState();
    }));

    this.addCommand(cmd('cat', 'concatenate files and print', (args) => {
      const path = args[0];
      if (!path) { this.print('usage: cat <file>'); return; }
      const node = this.vOS.resolve(path);
      if (!node) { this.print(unixErr(`cat: ${path}: No such file or directory`)); return; }
      if (node instanceof VDirectory) { this.print(unixErr(`cat: ${path}: Is a directory`)); return; }
      if (node.ftype === 'text') node.content.split('\n').forEach(line => this.print(line));
      else if (node.ftype === 'image') this.printHtml(`<img src="${node.content}" alt="${node.name}" style="max-width:100%;height:auto">`);
      else if (node.ftype === 'audio') this.printHtml(`<audio controls src="${node.content}">Not supported</audio>`);
      else if (node.ftype === 'exe') this.print('[Executable] run with: run ' + node.name);
      else this.print(`unsupported type: ${node.ftype}`);
    }));

    this.addCommand(cmd('mkdir', 'make directories', (args) => {
      const p = args[0]; if (!p) { this.print('usage: mkdir <dir>'); return; }
      if (!this.vOS.mkdir(p)) this.print(unixErr(`mkdir: cannot create directory '${p}'`));
      this._saveState();
    }));

    this.addCommand(cmd('rmdir', 'remove empty directories', (args) => {
      const p = args[0]; if (!p) { this.print('usage: rmdir <dir>'); return; }
      if (!this.vOS.rmdir(p)) this.print(unixErr(`rmdir: failed to remove '${p}'`));
      this._saveState();
    }));

    this.addCommand(cmd('touch', 'create file or update timestamp', (args) => {
      const p = args[0]; if (!p) { this.print('usage: touch <file>'); return; }
      const node = this.vOS.resolve(p);
      if (node instanceof VFile) { node.mtime = nowISO(); this.print(''); }
      else { if (!this.vOS.writeFile(p, '')) this.print(unixErr(`touch: cannot touch '${p}'`)); }
      this._saveState();
    }));

    this.addCommand(cmd('rm', 'remove files', (args) => {
      const p = args[0]; if (!p) { this.print('usage: rm <file>'); return; }
      if (!this.vOS.unlink(p)) this.print(unixErr(`rm: cannot remove '${p}'`));
      this._saveState();
    }));

    this.addCommand(cmd('echo', 'display a line of text', (args) => this.print(args.join(' '))));

    this.addCommand(cmd('history', 'command history (!n to rerun)', () => {
      this.commandHistory.forEach((c,i)=> this.print(`${i+1}  ${c}`));
    }));

    this.addCommand(cmd('date', 'print system date and time', () => this.print(new Date().toString()), ['time']));

    this.addCommand(cmd('clear', 'clear the screen', () => this.clear()));

    this.addCommand(cmd('run', 'run a registered addon', (args) => {
      if (!args[0]) { this.print('usage: run <addon> [args]'); return; }
      this.addons.start(args[0], this, this.vOS, ...args.slice(1));
    }));

    this.addCommand(cmd('exit', 'exit current mode or addon', () => {
      if (this.editor.isActive) this._editorStop();
      else if (this.rps.isActive) this._rpsStop();
      else this.addons.stop(this);
    }));

    // Simulated network tools (client-only)
    this.addCommand(cmd('ping', 'check connectivity (simulated)', async (args) => {
      const host = args[0]; if (!host) { this.print('usage: ping <host>'); return; }
      const n = Math.floor(Math.random()*4)+1; // 1..4 echoes
      for (let i=1;i<=n;i++) {
        const ms = Math.floor(20+Math.random()*180);
        await new Promise(r=>setTimeout(r, ms));
        this.print(`64 bytes from ${host}: icmp_seq=${i} time=${ms} ms`);
      }
      this.print(`--- ${host} ping statistics ---`);
      this.print(`${n} packets transmitted, ${n} received, 0% packet loss`);
    }));

    this.addCommand(cmd('curl', 'fetch URL (best-effort, may be blocked by CORS)', async (args) => {
      const url = args[0]; if (!url) { this.print('usage: curl <url>'); return; }
      try {
        const res = await fetch(url);
        const text = await res.text();
        this.print(text);
      } catch (e) {
        this.print(`curl: (6) Could not resolve host or blocked by CORS: ${url}`);
      }
    }));

    this.addCommand(cmd('edit', 'simple vi-like editor (:w, :q, :wq)', (args) => {
      const p = args[0]; if (!p) { this.print('usage: edit <file>'); return; }
      this._editorStart(p);
    }));

    this.addCommand(cmd('rps', 'play Rock, Paper, Scissors', () => this._rpsStart()));

    this.addCommand(cmd('tree', 'list contents of directories in a tree-like format', (args) => {
      const p = args[0] || '.';
      const dir = this.vOS.resolve(p);
      if (!(dir instanceof VDirectory)) { this.print(unixErr(`tree: '${p}': No such directory`)); return; }
      this.print(this.vOS.normalize(p));
      this._tree(dir, '');
    }));

    this.addCommand(cmd('top', 'display processes (simulated)', () => {
      this.print('PID   USER  PR NI  VIRT  RES  SHR  S %CPU %MEM   TIME+  COMMAND');
      this.print('1     root  20  0  1.2g  80m  10m  R  3.2  0.2   0:01.23 systemd');
      this.print('215   user  20  0  2.0g  96m  22m  S  1.1  0.3   0:00.54 node');
      this.print('...');
    }));

    this.addCommand(cmd('help', 'list available commands', () => {
      const uniq = [...new Set(Object.values(this.commands))];
      const lines = uniq.sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`${c.name.padEnd(10)} - ${c.description}`);
      this.print(lines.join('\n'));
    }));
  }

  _tree(dir, prefix) {
    const entries = Object.values(dir.children);
    entries.forEach((child, idx) => {
      const last = idx === entries.length - 1;
      const branch = last ? '└── ' : '├── ';
      const nextPref = prefix + (last ? '    ' : '│   ');
      this.print(prefix + branch + child.name + (child.kind==='dir'?'/':''));
      if (child instanceof VDirectory) this._tree(child, nextPref);
    });
  }

  // ------- Interactive modes -------
  _editorStart(path) {
    this.editor.isActive = true; this.editor.filePath = this.vOS.normalize(path);
    const node = this.vOS.resolve(path);
    this.editor.lines = (node instanceof VFile ? node.content : '').split('\n');
    this.editor.dirty = false;
    this.clear();
    this.print(`Editing \"${this.editor.filePath}\". Type and press Enter to add a line.`);
    this.print('Commands: :w (save), :q (quit), :wq (save & quit)');
    this.print('---');
    this.editor.lines.forEach((line,i)=> this.print(`${String(i+1).padStart(3)}  ${line}`));
  }
  _editorHandle(input) {
    if (input.startsWith(':')) {
      const cmd = input.substring(1);
      if (cmd === 'w') { this._editorSave(); }
      else if (cmd === 'q') { if (this.editor.dirty) this.print('Unsaved changes. Use :w or :wq.'); else this._editorStop(); }
      else if (cmd === 'wq') { this._editorSave(); this._editorStop(); }
      else this.print(`Unknown editor command: ${cmd}`);
      return;
    }
    this.editor.lines.push(input); this.editor.dirty = true; this.print(`${String(this.editor.lines.length).padStart(3)}  ${input}`);
  }
  _editorSave() {
    const content = this.editor.lines.join('\n');
    if (!this.vOS.writeFile(this.editor.filePath, content, 'text', true)) { this.print('Error: could not save.'); return; }
    this.editor.dirty = false; this.print('File saved.'); this._saveState();
  }
  _editorStop() {
    this.editor.isActive = false; this.editor.lines = []; this.editor.filePath = null; this.editor.dirty = false;
    this.clear(); this.print('Returned to main terminal.');
  }

  _rpsStart() {
    this.rps.isActive = true; this.rps.player = 0; this.rps.cpu = 0; this.rps.rounds = 0;
    this.clear();
    this.print('--- Rock, Paper, Scissors ---');
    this.print("Type: 'rock', 'paper', or 'scissors'. 'score' to view, 'exit' to quit.");
    this.print('------------------------------');
  }
  _rpsHandle(input) {
    const s = input.trim().toLowerCase();
    if (s === 'exit') { this._rpsStop(); return; }
    if (s === 'score') { this._rpsScore(); return; }
    if (!['rock','paper','scissors'].includes(s)) { this.print('Invalid choice.'); return; }
    const opts = ['rock','paper','scissors'];
    const cpu = opts[Math.floor(Math.random()*3)];
    this.print(`> You: ${s} | Computer: ${cpu}`);
    if (s === cpu) this.print("It's a tie!");
    else if ((s==='rock'&&cpu==='scissors')||(s==='paper'&&cpu==='rock')||(s==='scissors'&&cpu==='paper')) { this.print('You win this round!'); this.rps.player++; }
    else { this.print('Computer wins this round.'); this.rps.cpu++; }
    this.rps.rounds++; this.print('---');
  }
  _rpsScore(){ this.print('-- Score --'); this.print(`Player: ${this.rps.player}`); this.print(`Computer: ${this.rps.cpu}`); this.print(`Rounds: ${this.rps.rounds}`); this.print('-----------'); }
  _rpsStop(){ this.rps.isActive = false; this.clear(); this.print('Thanks for playing!'); this._rpsScore(); }

  // ------- Autocomplete -------
  _autoComplete() {
    const text = this.input.value;
    if (!text.trim()) return;
    const parts = text.match(/(?:[^\s\"]+|\"[^\"]*\")+/g) || [];
    const last = parts[parts.length-1] || '';
    const isPathy = last.startsWith('/') || last.startsWith('.') || last.startsWith('~');

    if (parts.length === 1 && !isPathy) {
      // command completion
      const all = [...new Set(Object.values(this.commands))].map(c=>c.name);
      const matches = all.filter(n=> n.startsWith(last));
      if (matches.length === 1) this.input.value = matches[0] + ' ';
      else if (matches.length > 1) this.print(matches.join('  '));
      return;
    }

    // path completion
    const before = parts.slice(0,-1).join(' ');
    const path = last;
    const norm = this.vOS.normalize(path);
    const dirPath = norm.endsWith('/') ? norm : norm.slice(0, norm.lastIndexOf('/')+1);
    const base = norm.slice(dirPath.length);
    const dir = this.vOS.resolve(dirPath || '.');
    if (!(dir instanceof VDirectory)) return;
    const ents = Object.keys(dir.children).filter(n=> n.startsWith(base));
    if (ents.length === 1) {
      const comp = dirPath + ents[0];
      const node = dir.children[ents[0]];
      const suffix = node instanceof VDirectory ? '/' : ' ';
      this.input.value = (before ? before+' ' : '') + comp + suffix;
    } else if (ents.length > 1) {
      this.print(ents.join('  '));
    }
  }

  // ------- Command runner -------
  runCommand(rawInput) {
    const input = rawInput.trim();
    if (!input) return;
    // prompt echo
    this.print(`${this.prompt()} ${input}`);

    // history (avoid dup consecutive)
    if (this.commandHistory[this.commandHistory.length-1] !== input) {
      this.commandHistory.push(input); this._saveHistory();
    }

    // editor / rps modes
    if (this.editor.isActive) { this._editorHandle(input); return; }
    if (this.rps.isActive) { this._rpsHandle(input); return; }

    // history expansion !n
    if (input.startsWith('!')) {
      const idx = parseInt(input.slice(1),10)-1;
      const cmd = this.commandHistory[idx];
      if (cmd) this.runCommand(cmd); else this.print('bash: history: invalid index');
      return;
    }

    // addon active
    if (this.addons.active) { this.addons.handle(input); return; }

    // parse
    const parts = input.match(/(?:[^\s\"]+|\"[^\"]*\")+/g) || [];
    const name = (parts.shift()||'').replace(/\"/g,'').toLowerCase();
    const args = parts.map(a=>a.replace(/\"/g,''));
    const cmd = this.commands[name];
    if (!cmd) { this.print(`bash: ${name}: command not found`); return; }
    cmd.execute(args, this);
  }
}

export { VOS, VFile, VDirectory, Addon, AddonExecutor, BootCheck, BootCheckRegistry };
