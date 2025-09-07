// ==========================
// CentralTerminal v5.0.1 — Client-only, BASH-like web terminal emulator
// - POSIX pathing throughout
// - Better realism: timestamps, overwrite flags, unixy errors
// - Interactivity: autocomplete, history nav, Ctrl+C, prompt
// - Persistence: localStorage for VFS + history + cwd
// - Safe: client-side only; simulated network
// - Bug fixes and minor improvements from v5.0.0
// ==========================

// ---------- Utility ----------
const nowISO = () => new Date().toISOString();
const deepClone = obj => JSON.parse(JSON.stringify(obj));

// ---------- Virtual FS ----------
class VFile {
  constructor(name, content = '', ftype = 'text', mode = 0o644) {
    this.kind = 'file';
    this.name = name;
    this.content = content;
    this.ftype = ftype;
    this.mode = mode;
    this.ctime = nowISO();
    this.mtime = this.ctime;
  }
}

class VDirectory {
  constructor(name) {
    this.kind = 'dir';
    this.name = name;
    this.children = {};
  }
  getChild(name) { return this.children[name]; }
}

class VOS {
  constructor() {
    this.root = new VDirectory('');
    this.homePath = '/home/user';
    this.cwd = this._mkdirp(this.homePath);
    this._seed();
  }

  // ---------- Serialization ----------
  toJSON() {
    const encode = node => {
      if (node.kind === 'dir') {
        const out = { kind: 'dir', name: node.name, children: {} };
        for (const [k, v] of Object.entries(node.children)) out.children[k] = encode(v);
        return out;
      }
      return deepClone({ kind: 'file', name: node.name, content: node.content, ftype: node.ftype, mode: node.mode, ctime: node.ctime, mtime: node.mtime });
    };
    return { root: encode(this.root), cwd: this.pathOf(this.cwd), homePath: this.homePath };
  }

  static fromJSON(json) {
    const decode = obj => {
      if (obj.kind === 'dir') {
        const d = new VDirectory(obj.name);
        for (const [k, v] of Object.entries(obj.children || {})) d.children[k] = decode(v);
        return d;
      }
      const f = new VFile(obj.name, obj.content, obj.ftype, obj.mode);
      f.ctime = obj.ctime; f.mtime = obj.mtime;
      return f;
    };
    const vos = new VOS();
    vos.root = decode(json.root);
    vos.cwd = vos.resolve(json.cwd) || vos._mkdirp('/home/user');
    vos.homePath = json.homePath || '/home/user';
    return vos;
  }

  // ---------- Helpers ----------
  _seed() {
    this.mkdir('/home'); this.mkdir('/bin'); this.mkdir('/etc'); this.mkdir('/docs'); this.mkdir('/media');
    this.mkdir('/media/images'); this.mkdir('/media/audio');
    this.writeFile('/etc/motd', 'Welcome to the Central Terminal!\n\nHave a great day!');
    const demo = `# Welcome to the Virtual File System!\n\nUse commands: ls, cd, cat, tree.\nEnjoy!\n`;
    this.writeFile('/docs/guide.txt', demo);
  }

  normalize(path) {
    if (!path) return this.pathOf(this.cwd);
    if (path.startsWith('~')) path = path.replace('~', this.homePath);
    const abs = path.startsWith('/') ? path : this.pathOf(this.cwd) + '/' + path;
    const parts = abs.split('/');
    const stack = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') stack.pop();
      else stack.push(part);
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
    if (parent.children[name]) return false;
    parent.children[name] = new VDirectory(name);
    return true;
  }

  rmdir(path) {
    const dir = this.resolve(path);
    if (!(dir instanceof VDirectory)) return false;
    if (Object.keys(dir.children).length) return false;
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
      if (!(exists instanceof VFile)) return false;
      if (!overwrite) return false;
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
    return Object.values(dir.children).map(c => c.kind === 'dir' ? c.name+'/' : c.ftype==='exe'?c.name+'*':c.name).sort();
  }

  chdir(path) {
    const dir = this.resolve(path);
    if (dir instanceof VDirectory) { this.cwd = dir; return true; }
    return false;
  }
}

// ---------- Boot Checks ----------
class BootCheck { constructor(name, fn, description=''){ this.name=name; this.fn=fn; this.description=description; } }
class BootCheckRegistry {
  constructor(){ this.checks=[]; }
  add(check){ this.checks.push(check); }
  async run(term){
    let ok=true;
    for(const c of this.checks){
      term._biosWrite(`Running: ${c.name}... `);
      try{
        const passed = await c.fn();
        term._biosWriteLine(passed?'<span class="status-ok">OK</span>':'<span class="status-failed">FAILED</span>');
        if(!passed) ok=false;
      }catch{
        term._biosWriteLine('<span class="status-failed">FAILED</span>'); ok=false;
      }
    }
    return ok;
  }
}

// ---------- Addons ----------
class Addon{ constructor(name){ this.name=name; this.term=null; } init(term){ this.term=term; } }

// ---------- Central Terminal ----------
class CentralTerminal {
  constructor(ui){
    this.version='5.0.1';
    this.ui=ui;
    this.vOS=new VOS();
    this.history=[];
    this.historyIndex=-1;
    this.commands={};
    this.editor={isActive:false,_buffer:'',lines:[],filePath:null,dirty:false};
    this.rps={isActive:false,player:0,cpu:0,rounds:0};
    this.addons={active:false,handle:null};
    this.commandHistory = [];
    this.bootRegistry=new BootCheckRegistry();
    this._registerDefaultCommands();
  }

  _print(text){ this.ui.appendTerminalOutput(text); }
  _biosWrite(text){ this.ui.appendTerminalOutput(text,false); }
  _biosWriteLine(text){ this.ui.appendTerminalOutput(text,true); }
  clear(){ this.ui.clearTerminal(); }
  prompt(){ return '$'; }
  _saveHistory(){ localStorage.setItem('cterm_history', JSON.stringify(this.commandHistory)); }
  _saveState(){ localStorage.setItem('cterm_vos', JSON.stringify(this.vOS.toJSON())); }

  addCommand(cmd){ this.commands[cmd.name]=cmd; }

  runCommand(rawInput){
    const input = rawInput.trim();
    if(!input) return;

    // prompt echo
    this._print(`${this.prompt()} ${input}`);

    // history (avoid dup consecutive)
    if(this.commandHistory[this.commandHistory.length-1] !== input) {
      this.commandHistory.push(input); this._saveHistory();
    }

    // modes
    if(this.editor.isActive) { this._editorHandle(input); return; }
    if(this.rps.isActive) { this._rpsHandle(input); return; }

    // history expansion !n
    if (input.startsWith('!')) {
      const idx = parseInt(input.slice(1),10)-1;
      const cmd = this.commandHistory[idx];
      if (cmd) this.runCommand(cmd); else this._print('bash: history: invalid index');
      return;
    }

    // addon active
    if(this.addons.active) { this.addons.handle(input); return; }

    // parse command
    const parts = input.match(/(?:[^\s\"]+|\"[^\"]*\")+/g) || [];
    const name = (parts.shift()||'').replace(/\"/g,'').toLowerCase();
    const args = parts.map(a=>a.replace(/\"/g,''));
    const cmd = this.commands[name];
    if (!cmd) { this._print(`bash: ${name}: command not found`); return; }
    cmd.execute(args, this);
  }

  // ---------- Default Commands ----------
  _registerDefaultCommands() {
    const cmd = (name, desc, exec) => ({ name, desc, execute: exec });
  
    // ---- Basic Navigation ----
    this.addCommand(cmd('ls', 'list files', args => {
      const files = this.vOS.ls(args[0] || '.');
      this._print(files ? files.join(' ') : 'ls: cannot access');
    }));
    this.addCommand(cmd('cd', 'change directory', args => {
      const ok = this.vOS.chdir(args[0] || this.vOS.homePath);
      if (!ok) this._print(`cd: ${args[0]}: No such directory`);
    }));
    this.addCommand(cmd('pwd', 'print working directory', () => this._print(this.vOS.pathOf(this.vOS.cwd))));
  
    // ---- File management ----
    this.addCommand(cmd('mkdir', 'make directory', args => {
      if (!args[0]) { this._print('usage: mkdir <dir>'); return; }
      if (!this.vOS.mkdir(args[0])) this._print(`mkdir: cannot create directory '${args[0]}'`);
    }));
    this.addCommand(cmd('rmdir', 'remove empty directory', args => {
      if (!args[0]) { this._print('usage: rmdir <dir>'); return; }
      if (!this.vOS.rmdir(args[0])) this._print(`rmdir: failed to remove '${args[0]}'`);
    }));
    this.addCommand(cmd('rm', 'remove file', args => {
      if (!args[0]) { this._print('usage: rm <file>'); return; }
      const path = this.vOS.normalize(args[0]);
      if (!this.vOS.unlink(path)) this._print(`rm: cannot remove '${args[0]}'`);
    }));    
    this.addCommand(cmd('cp', 'copy file', args => {
      const [src, dest] = args;
      if (!src || !dest) { this._print('usage: cp <src> <dest>'); return; }
      const srcPath = this.vOS.normalize(src);
      const destPath = this.vOS.normalize(dest);
      const node = this.vOS.resolve(srcPath);
      if (!(node instanceof VFile)) { this._print(`cp: cannot copy '${src}'`); return; }
      if (!this.vOS.writeFile(destPath, node.content, node.ftype, true)) this._print(`cp: cannot write to '${dest}'`);
    }));
    
    this.addCommand(cmd('mv', 'move/rename file', args => {
      const [src, dest] = args;
      if (!src || !dest) { this._print('usage: mv <src> <dest>'); return; }
      const srcPath = this.vOS.normalize(src);
      const destPath = this.vOS.normalize(dest);
      const node = this.vOS.resolve(srcPath);
      if (!node) { this._print(`mv: cannot stat '${src}'`); return; }
      if (!this.vOS.writeFile(destPath, node.content || '', node.ftype, true)) { this._print(`mv: cannot move to '${dest}'`); return; }
      if (!this.vOS.unlink(srcPath)) this._print(`mv: cannot remove '${src}' after move`);
    }));    
    this.addCommand(cmd('touch', 'create empty file', args => {
      if (!args[0]) { this._print('usage: touch <file>'); return; }
      this.vOS.writeFile(args[0], '', 'text', true);
    }));
    this.addCommand(cmd('cat', 'print file contents', args => {
      const content = this.vOS.readFile(args[0]);
      if (content === null) this._print(`cat: ${args[0]}: No such file`);
      else this._print(content);
    }));
    this.addCommand(cmd('head', 'first N lines of a file', args => {
      const f = args[0]; const n = parseInt(args[1]||'10',10);
      const node = this.vOS.resolve(f);
      if (!node || !(node instanceof VFile)) { this._print(`head: cannot open '${f}'`); return; }
      node.content.split('\n').slice(0,n).forEach(l=>this._print(l));
    }));
    this.addCommand(cmd('tail', 'last N lines of a file', args => {
      const f = args[0]; const n = parseInt(args[1]||'10',10);
      const node = this.vOS.resolve(f);
      if (!node || !(node instanceof VFile)) { this._print(`tail: cannot open '${f}'`); return; }
      node.content.split('\n').slice(-n).forEach(l=>this._print(l));
    }));
    this.addCommand(cmd('ln', 'create symbolic link (mock)', args => {
      this._print('ln: symbolic links not fully implemented in VFS');
    }));
    this.addCommand(cmd('find', 'find files/directories (mock)', args => {
      this._print('find: recursive search not implemented');
    }));
    this.addCommand(cmd('chmod', 'change file permissions (mock)', args => {
      this._print('chmod: permission change simulated');
    }));
    this.addCommand(cmd('chown', 'change file owner (mock)', args => {
      this._print('chown: ownership simulated');
    }));
    this.addCommand(cmd('chgrp', 'change group (mock)', args => {
      this._print('chgrp: group change simulated');
    }));
    this.addCommand(cmd('umask', 'show umask', args => {
      this._print('umask: 022');
    }));
  
    // ---- Process / system ----
    this.addCommand(cmd('ps', 'list processes (mock)', args => this._print('PID TTY TIME CMD\n1 pts/0 00:00 bash\n2 pts/0 00:00 node')));
    this.addCommand(cmd('top', 'process monitor (mock)', args => this._print('Top: simulated')));
    this.addCommand(cmd('kill', 'kill process (mock)', args => this._print('kill: simulated')));
    this.addCommand(cmd('pkill', 'kill by name (mock)', args => this._print('pkill: simulated')));
    this.addCommand(cmd('pgrep', 'find process by name (mock)', args => this._print('pgrep: simulated')));
    this.addCommand(cmd('grep', 'search pattern in file', args => {
      const [p,f] = args; if(!p||!f){ this._print('usage: grep <pattern> <file>'); return; }
      const node = this.vOS.resolve(f); if(!node || !(node instanceof VFile)){ this._print(`grep: ${f}: No such file`); return; }
      const re = new RegExp(p); node.content.split('\n').forEach(l=>{ if(re.test(l)) this._print(l); });
    }));
  
    // ---- System Info ----
    this.addCommand(cmd('uname', 'system information', () => this._print('CentralTerminal OS v5.0.1')));
    this.addCommand(cmd('whoami', 'current user', () => this._print('user')));
    this.addCommand(cmd('df', 'disk usage', () => this._print('/dev/vfs 1024M 512M 512M 50% /')));
    this.addCommand(cmd('du', 'directory usage', () => this._print('docs/ 4K\nhome/user/ 8K')));
    this.addCommand(cmd('free', 'memory info', () => this._print('Mem: total 1024MB used 512MB free 512MB')));
    this.addCommand(cmd('uptime', 'system uptime', () => this._print('up 1 day, 3:45')));
  
    // ---- Editor / fun ----
    this.addCommand(cmd('vim', 'shortcut to editor', args => {
      if (!args[0]) { this._print('usage: vim <file>'); return; }
      this._editorStart(args[0]);
    }));
    this.addCommand(cmd('edit', 'edit file', args => {
      if (!args[0]) { this._print('usage: edit <file>'); return; }
      this._editorStart(args[0]);
    }));
    this.addCommand(cmd('rps', 'play rock-paper-scissors', () => this._rpsStart()));
    this.addCommand(cmd('tree', 'show directory tree', args => {
      const dir = this.vOS.resolve(args[0]||'.');
      if (!(dir instanceof VDirectory)) { this._print(`tree: ${args[0]}: No such directory`); return; }
      this._tree(dir,'');
    }));
  
    // ---- Utilities ----
    this.addCommand(cmd('echo', 'echo arguments', args => this._print(args.join(' '))));
    this.addCommand(cmd('history', 'command history', () => this.commandHistory.forEach((h,i)=>this._print(`${i+1}  ${h}`))));
    this.addCommand(cmd('date', 'current date/time', () => this._print(new Date().toString())));
    this.addCommand(cmd('clear', 'clear terminal screen', () => this.clear()));
    this.addCommand(cmd('run', 'run command (alias)', args => this.runCommand(args.join(' '))));
    this.addCommand(cmd('exit', 'exit terminal', () => this._print('Exiting terminal...')));
    this.addCommand(cmd('ping', 'ping host (mock)', args => this._print(`PING ${args[0]||'localhost'}: 32 bytes`)));
    this.addCommand(cmd('curl', 'fetch URL (mock)', args => this._print(`curl: fetched ${args[0]||'http://example.com'}`)));
    this.addCommand(cmd('help', 'show help', () => Object.values(this.commands).forEach(c => this._print(`${c.name} - ${c.desc}`))));

    // ---- Fun / Visual ----
    this.addCommand(cmd('aafire', 'ASCII fire animation', async () => {
      this._print('Starting ASCII fire... Press Ctrl+C to stop.');
      const fireFrames = [
        "  (  )   (   )  ",
        " (    ) (     ) ",
        "  )  (   )  (   ",
        " (    ) (     ) ",
        "  (  )   (   )  "
      ];
      let running = true;
      const stop = () => running = false;
      this.ui.registerCtrlC(stop); // hypothetical Ctrl+C handler
      while (running) {
        for (const frame of fireFrames) {
          if (!running) break;
          this._print(frame);
          await new Promise(r => setTimeout(r, 200));
        }
      }
      this._print('ASCII fire stopped.');
    }));

    this.addCommand(cmd('cmatrix', 'Matrix-style falling text', async () => {
      this._print('Starting Matrix... Press Ctrl+C to stop.');
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
      const width = 30;
      let running = true;
      const stop = () => running = false;
      this.ui.registerCtrlC(stop);
      while (running) {
        const line = Array.from({length: width}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
        this._print(line);
        await new Promise(r => setTimeout(r, 100));
      }
      this._print('Matrix stopped.');
    }));

  }   

  // ---------- Interactive Editor ----------
  _editorStart(path){
    this.editor.isActive=true;
    this.editor.filePath=this.vOS.normalize(path);
    const node = this.vOS.resolve(path);
    this.editor.lines = (node instanceof VFile ? node.content : '').split('\n');
    this.editor.dirty=false;
    this.clear();
    this._print(`Editing "${this.editor.filePath}". Type and press Enter to add a line.`);
    this._print('Commands: :w (save), :q (quit), :wq (save & quit)');
    this.editor.lines.forEach((line,i)=>this._print(`${String(i+1).padStart(3)}  ${line}`));
  }
  _editorHandle(input){
    if(input.startsWith(':')){
      const cmd = input.substring(1);
      if(cmd==='w'){ this._editorSave(); }
      else if(cmd==='q'){ if(this.editor.dirty)this._print('Unsaved changes. Use :w or :wq.'); else this._editorStop(); }
      else if(cmd==='wq'){ this._editorSave(); this._editorStop(); }
      else this._print(`Unknown editor command: ${cmd}`);
      return;
    }
    this.editor.lines.push(input); this.editor.dirty=true; this._print(`${String(this.editor.lines.length).padStart(3)}  ${input}`);
  }
  _editorSave(){ const content=this.editor.lines.join('\n'); if(!this.vOS.writeFile(this.editor.filePath,content,'text',true)){ this._print('Error: could not save.'); return; } this.editor.dirty=false; this._print('File saved.'); this._saveState(); }
  _editorStop(){ this.editor.isActive=false; this.editor.lines=[]; this.editor.filePath=null; this.editor.dirty=false; this.clear(); this._print('Returned to main terminal.'); }

  // ---------- RPS ----------
  _rpsStart(){ this.rps.isActive=true; this.rps.player=0; this.rps.cpu=0; this.rps.rounds=0; this.clear(); this._print('--- Rock, Paper, Scissors ---'); this._print("Type: 'rock', 'paper', or 'scissors'. 'score' to view, 'exit' to quit."); }
  _rpsHandle(input){ const s=input.trim().toLowerCase(); if(s==='exit'){ this._rpsStop(); return; } if(s==='score'){ this._rpsScore(); return; } if(!['rock','paper','scissors'].includes(s)){ this._print('Invalid choice.'); return; } const opts=['rock','paper','scissors']; const cpu=opts[Math.floor(Math.random()*3)]; this._print(`> You: ${s} | Computer: ${cpu}`); if(s===cpu)this._print("It's a tie!"); else if((s==='rock'&&cpu==='scissors')||(s==='paper'&&cpu==='rock')||(s==='scissors'&&cpu==='paper')){ this._print('You win this round!'); this.rps.player++; } else { this._print('Computer wins this round.'); this.rps.cpu++; } this.rps.rounds++; this._print('---'); }
  _rpsScore(){ this._print('-- Score --'); this._print(`Player: ${this.rps.player}`); this._print(`Computer: ${this.rps.cpu}`); this._print(`Rounds: ${this.rps.rounds}`); this._print('-----------'); }
  _rpsStop(){ this.rps.isActive=false; this.clear(); this._print('Thanks for playing!'); this._rpsScore(); }

  // ---------- Autocomplete ----------
  _autoComplete(){
    const text=this.input.value;
    if(!text.trim()) return;
    const parts=text.match(/(?:[^\s\"]+|\"[^\"]*\")+/g)||[];
    const last=parts[parts.length-1]||'';
    const isPathy=last.startsWith('/')||last.startsWith('.')||last.startsWith('~');

    if(parts.length===1&&!isPathy){
      const all=[...new Set(Object.values(this.commands))].map(c=>c.name);
      const matches=all.filter(n=>n.startsWith(last));
      if(matches.length===1)this.input.value=matches[0]+' ';
      else if(matches.length>1)this._print(matches.join('  '));
      return;
    }

    const before=parts.slice(0,-1).join(' ');
    const path=last;
    const norm=this.vOS.normalize(path);
    const dirPath=norm.endsWith('/')?norm:norm.slice(0,norm.lastIndexOf('/')+1);
    const base=norm.slice(dirPath.length);
    const dir=this.vOS.resolve(dirPath||'.');
    if(!(dir instanceof VDirectory)) return;
    const ents=Object.keys(dir.children).filter(n=>n.startsWith(base));
    if(ents.length===1){ const comp=dirPath+ents[0]; const node=dir.children[ents[0]]; const suffix=node instanceof VDirectory?'/':' '; this.input.value=(before?before+' ':'')+comp+suffix; }
    else if(ents.length>1)this._print(ents.join('  '));
  }
}

export { CentralTerminal, BootCheck, BootCheckRegistry, Addon, VFile, VDirectory, VOS };
