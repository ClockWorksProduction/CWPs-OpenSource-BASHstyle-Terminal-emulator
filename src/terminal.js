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
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

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

  // --- serialization ---
  toJSON() {
    const encode = (node) => {
      if (node.kind === 'dir') {
        const out = { kind: 'dir', name: node.name, children: {} };
        for (const [k,v] of Object.entries(node.children)) out.children[k] = encode(v);
        return out;
      }
      return deepClone({
        kind:'file', name:node.name, content:node.content, ftype:node.ftype,
        mode:node.mode, ctime:node.ctime, mtime:node.mtime
      });
    };
    return { root:encode(this.root), cwd:this.pathOf(this.cwd), homePath:this.homePath };
  }

  static fromJSON(json) {
    const decode = (obj) => {
      if (obj.kind === 'dir') {
        const d = new VDirectory(obj.name);
        for (const [k,v] of Object.entries(obj.children||{})) d.children[k]=decode(v);
        return d;
      }
      const f = new VFile(obj.name,obj.content,obj.ftype,obj.mode);
      f.ctime=obj.ctime; f.mtime=obj.mtime; return f;
    };
    const vos = new VOS();
    vos.root = decode(json.root);
    vos.cwd = vos.resolve(json.cwd) || vos._mkdirp('/home/user');
    vos.homePath = json.homePath||'/home/user';
    return vos;
  }

  _seed() {
    this.mkdir('/home'); this.mkdir('/home/user'); this.mkdir('/bin'); this.mkdir('/etc'); this.mkdir('/docs'); this.mkdir('/media'); this.mkdir('/media/images'); this.mkdir('/media/audio');
    this.writeFile('/etc/motd','Welcome to the Central Terminal!\n\nHave a great day!');
    const demo=`# Welcome to the Virtual File System!\n\nUse commands: ls, cd, cat, tree.\nEnjoy!\n`;
    this.writeFile('/docs/guide.txt',demo);
  }

  normalize(path) {
    if(!path||path==='') return this.pathOf(this.cwd);
    if(path.startsWith('~')) path=path.replace('~',this.homePath);
    const abs = path.startsWith('/')?path:this.pathOf(this.cwd)+'/'+path;
    const parts = abs.split('/');
    const stack = [];
    for(const part of parts){
      if(!part||part==='.'){continue;}
      if(part==='..'){stack.pop(); continue;}
      stack.push(part);
    }
    return '/'+stack.join('/');
  }

  resolve(path) {
    const norm=this.normalize(path);
    if(norm==='/') return this.root;
    const segs=norm.split('/').filter(Boolean);
    let cur=this.root;
    for(const s of segs){
      if(!(cur instanceof VDirectory)) return null;
      cur=cur.children[s];
      if(!cur) return null;
    }
    return cur;
  }

  parentOf(path){
    const norm=this.normalize(path);
    if(norm==='/') return null;
    const up=norm.slice(0,norm.lastIndexOf('/'))||'/';
    return this.resolve(up);
  }

  pathOf(node){
    const path=[];
    const dfs=(cur,target,acc)=>{
      if(cur===target){path.push(...acc); return true;}
      if(cur.kind!=='dir') return false;
      for(const [name,child] of Object.entries(cur.children)){
        if(dfs(child,target,[...acc,name])) return true;
      }
      return false;
    };
    if(node===this.root) return '/';
    dfs(this.root,node,[]);
    return '/'+path.join('/');
  }

  _mkdirp(path){
    const norm=this.normalize(path);
    if(norm==='/') return this.root;
    const segs=norm.split('/').filter(Boolean);
    let cur=this.root;
    for(const s of segs){
      if(!cur.children[s]) cur.children[s]=new VDirectory(s);
      cur=cur.children[s];
      if(!(cur instanceof VDirectory)) throw new Error('ENOTDIR: not a directory, '+s);
    }
    return cur;
  }

  mkdir(path){
    const parent=this.parentOf(path);
    if(!(parent instanceof VDirectory)) return false;
    const name=this.normalize(path).split('/').filter(Boolean).pop();
    if(parent.children[name]) return false;
    parent.children[name]=new VDirectory(name);
    return true;
  }

  rmdir(path){
    const dir=this.resolve(path);
    if(!(dir instanceof VDirectory)) return false;
    if(Object.keys(dir.children).length) return false;
    const parent=this.parentOf(path);
    if(!parent) return false;
    delete parent.children[dir.name];
    return true;
  }

  writeFile(path,content='',ftype='text',overwrite=true){
    const parent=this.parentOf(path);
    if(!(parent instanceof VDirectory)) return false;
    const name=this.normalize(path).split('/').filter(Boolean).pop();
    const exists=parent.children[name];
    if(exists){
      if(!(exists instanceof VFile)) return false;
      if(!overwrite) return false;
      exists.content=content; exists.mtime=nowISO(); exists.ftype=ftype;
      return true;
    }
    parent.children[name]=new VFile(name,content,ftype);
    return true;
  }

  readFile(path){
    const node=this.resolve(path);
    if(node instanceof VFile) return node.content;
    return null;
  }

  unlink(path){
    const parent=this.parentOf(path);
    const node=this.resolve(path);
    if(!(parent instanceof VDirectory)||!(node instanceof VFile)) return false;
    delete parent.children[node.name];
    return true;
  }

  ls(path='.'){
    const dir=this.resolve(path);
    if(!(dir instanceof VDirectory)) return null;
    return Object.values(dir.children).map(c=>c.kind==='dir'?c.name+'/':c.ftype==='exe'?c.name+'*':c.name).sort();
  }

  chdir(path){
    const dir=this.resolve(path);
    if(dir instanceof VDirectory){ this.cwd=dir; return true; }
    return false;
  }
}

// ---------- Boot Checks ----------
class BootCheck{constructor(name,fn,desc=''){this.name=name;this.fn=fn;this.description=desc;}}
class BootCheckRegistry{constructor(){this.checks=[];} add(c){this.checks.push(c);} async run(term){let ok=true; for(const c of this.checks){term._biosWrite(`Running: ${c.name}... `); try{const p=await c.fn(); term._biosWriteLine(p?'<span class="status-ok">OK</span>':'<span class="status-failed">FAILED</span>'); if(!p)ok=false;}catch{term._biosWriteLine('<span class="status-failed">FAILED</span>'); ok=false;} } return ok;}}

// ---------- Addons ----------
class Addon{constructor(name){this.name=name; this.term=null;} init(term){this.term=term;}}

// ---------- Terminal ----------
class CentralTerminal {
  constructor(ui){
    this.version='5.0.1';
    this.ui=ui;
    this.vOS=new VOS();
    this.history=[];
    this.historyIndex=-1;
    this.commands={};
    this.editor={isActive:false, _buffer:''};
    this.rps={isActive:false, player:0, cpu:0, rounds:0};
    this.addons={active:false, handle:null};
    this.commandHistory=[];
    this.bootRegistry=new BootCheckRegistry();
    this._registerDefaultCommands();
  }

  print(txt){ this.ui.appendTerminalOutput(txt); }
  clear(){ this.ui.clearTerminal(); }
  _biosWrite(txt){ this.ui.appendTerminalOutput(txt,false); }
  _biosWriteLine(txt){ this.ui.appendTerminalOutput(txt,true); }

  addCommand(cmd){ this.commands[cmd.name]=cmd; }

  _registerDefaultCommands(){
    const cmd=(name,desc,exec)=>({name,desc,execute:exec});
    this.addCommand(cmd('help','show this help',()=>{ Object.values(this.commands).forEach(c=>this.print(`${c.name} - ${c.desc}`)); }));
    this.addCommand(cmd('echo','echo arguments',(args)=>this.print(args.join(' '))));
    this.addCommand(cmd('pwd','print working directory',()=>this.print(this.vOS.pathOf(this.vOS.cwd))));
    this.addCommand(cmd('ls','list files',(args)=>this.print(this.vOS.ls(args[0]||'.').join(' '))));
    this.addCommand(cmd('cd','change directory',(args)=>{ const ok=this.vOS.chdir(args[0]||this.vOS.homePath); if(!ok)this.print(`cd: ${args[0]}: No such directory`); }));
    this.addCommand(cmd('cat','print file contents',(args)=>{ const c=this.vOS.readFile(args[0]); if(c===null){this.print(`cat: ${args[0]}: No such file`); return;} this.print(c); }));
    // head
    this.addCommand(cmd('head','first N lines of a file',(args)=>{ const f=args[0]; const n=parseInt(args[1]||'10',10); if(!f){this.print('usage: head <file> [n]'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`head: cannot open '${f}'`); return;} node.content.split('\n').slice(0,n).forEach(l=>this.print(l)); }));
    // tail
    this.addCommand(cmd('tail','last N lines of a file',(args)=>{ const f=args[0]; const n=parseInt(args[1]||'10',10); if(!f){this.print('usage: tail <file> [n]'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`tail: cannot open '${f}'`); return;} node.content.split('\n').slice(-n).forEach(l=>this.print(l)); }));
    // wc
    this.addCommand(cmd('wc','line word byte count',(args)=>{ const f=args[0]; if(!f){this.print('usage: wc <file>'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`wc: ${f}: No such file`); return;} const lines=node.content.split('\n').length; const words=node.content.split(/\s+/).filter(Boolean).length; const bytes=new TextEncoder().encode(node.content).length; this.print(`${lines} ${words} ${bytes} ${f}`); }));
    // grep
    this.addCommand(cmd('grep','search pattern in file',(args)=>{ const p=args[0]; const f=args[1]; if(!p||!f){this.print('usage: grep <pattern> <file>'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`grep: ${f}: No such file`); return;} const re=new RegExp(p); node.content.split('\n').forEach(l=>{if(re.test(l))this.print(l);}); }));
    // sort
    this.addCommand(cmd('sort','sort lines of a file',(args)=>{ const f=args[0]; if(!f){this.print('usage: sort <file>'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`sort: cannot read: ${f}`); return;} node.content.split('\n').sort().forEach(l=>this.print(l)); }));
    // uniq
    this.addCommand(cmd('uniq','unique consecutive lines',(args)=>{ const f=args[0]; if(!f){this.print('usage: uniq <file>'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`uniq: cannot read: ${f}`); return;} const lines=node.content.split('\n'); lines.filter((l,i)=>i===0||l!==lines[i-1]).forEach(l=>this.print(l)); }));
    // cut
    this.addCommand(cmd('cut','cut fields from a file',(args)=>{ const f=args[0]; const delim=args[1]||' '; const fld=parseInt(args[2]||'1',10); if(!f){this.print('usage: cut <file> [delim] [field]'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`cut: cannot read: ${f}`); return;} node.content.split('\n').forEach(l=>{ const parts=l.split(delim); this.print(parts[fld-1]||''); }); }));
    // tr
    this.addCommand(cmd('tr','translate characters in file',(args)=>{ const from=args[0]; const to=args[1]; const f=args[2]; if(!from||!to||!f){this.print('usage: tr <from> <to> <file>'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`tr: cannot read: ${f}`); return;} const map={}; for(let i=0;i<from.length;i++) map[from[i]]=to[i]||''; this.print(node.content.split('').map(ch=>map[ch]||ch).join('')); }));
    // file
    this.addCommand(cmd('file','show file type',(args)=>{ const f=args[0]; if(!f){this.print('usage: file <file>'); return;} const node=this.vOS.resolve(f); if(!node){this.print(`file: ${f}: No such file`); return;} if(node instanceof VDirectory) this.print(`${f}: directory`); else this.print(`${f}: ${node.ftype}`); }));
    // less
    this.addCommand(cmd('less','view file with pagination',(args)=>{ const f=args[0]; if(!f){this.print('usage: less <file>'); return;} const node=this.vOS.resolve(f); if(!node||!(node instanceof VFile)){this.print(`less: ${f}: No such file`); return;} const lines=node.content.split('\n'); const pageSize=20; let index=0; const showPage=()=>{lines.slice(index,index+pageSize).forEach(l=>this.print(l)); index+=pageSize; if(index>=lines.length)this.print('(END)'); else this.print('--More-- (Enter=next,q=quit)');}; showPage(); }));
  }

  // Interactive modes, autocomplete, and command runner
  _editorStart(path){this.editor.isActive=true; this.editor.filePath=this.vOS.normalize(path); const node=this.vOS.resolve(path); this.editor.lines=(node instanceof VFile?node.content:'').split('\n'); this.editor.dirty=false; this.clear(); this.print(`Editing \"${this.editor.filePath}\". Type and press Enter to add a line.`); this.print('Commands: :w (save), :q (quit), :wq (save & quit)'); this.print('---'); this.editor.lines.forEach((line,i)=>this.print(`${String(i+1).padStart(3)}  ${line}`));}
  _editorHandle(input){if(input.startsWith(':')){const cmd=input.substring(1); if(cmd==='w'){this._editorSave();} else if(cmd==='q'){if(this.editor.dirty)this.print('Unsaved changes. Use :w or :wq.'); else this._editorStop();} else if(cmd==='wq'){this._editorSave(); this._editorStop();} else this.print(`Unknown editor command: ${cmd}`); return;} this.editor.lines.push(input); this.editor.dirty=true; this.print(`${String(this.editor.lines.length).padStart(3)}  ${input}`);}
  _editorSave(){const content=this.editor.lines.join('\n'); if(!this.vOS.writeFile(this.editor.filePath,content,'text',true)){this.print('Error: could not save.'); return;} this.editor.dirty=false; this.print('File saved.');}
  _editorStop(){this.editor.isActive=false; this.editor.lines=[]; this.editor.filePath=null; this.editor.dirty=false; this.clear(); this.print('Returned to main terminal.');}

  _rpsStart(){this.rps.isActive=true; this.rps.player=0; this.rps.cpu=0; this.rps.rounds=0; this.clear(); this.print('--- Rock, Paper, Scissors ---'); this.print("Type: 'rock', 'paper', or 'scissors'. 'score' to view, 'exit' to quit."); this.print('------------------------------');}
  _rpsHandle(input){const s=input.trim().toLowerCase(); if(s==='exit'){this._rpsStop(); return;} if(s==='score'){this._rpsScore(); return;} if(!['rock','paper','scissors'].includes(s)){this.print('Invalid choice.'); return;} const opts=['rock','paper','scissors']; const cpu=opts[Math.floor(Math.random()*3)]; this.print(`> You: ${s} | Computer: ${cpu}`); if(s===cpu)this.print("It's a tie!"); else if((s==='rock'&&cpu==='scissors')||(s==='paper'&&cpu==='rock')||(s==='scissors'&&cpu==='paper')){this.print('You win this round!'); this.rps.player++; } else { this.print('Computer wins this round.'); this.rps.cpu++; } this.rps.rounds++; this.print('---'); }
  _rpsScore(){ this.print('-- Score --'); this.print(`Player: ${this.rps.player}`); this.print(`Computer: ${this.rps.cpu}`); this.print(`Rounds: ${this.rps.rounds}`); this.print('-----------'); }
  _rpsStop(){ this.rps.isActive=false; this.clear(); this.print('Thanks for playing!'); this._rpsScore(); }

  _autoComplete(inputElement){
    const text=inputElement.value;
    if(!text.trim()) return;
    const parts=text.match(/(?:[^\s\"]+|\"[^\"]*\")+/g)||[];
    const last=parts[parts.length-1]||'';
    const isPathy=last.startsWith('/')||last.startsWith('.')||last.startsWith('~');

    if(parts.length===1 && !isPathy){
      const all=[...new Set(Object.values(this.commands))].map(c=>c.name);
      const matches=all.filter(n=>n.startsWith(last));
      if(matches.length===1) inputElement.value=matches[0]+' ';
      else if(matches.length>1) this.print(matches.join('  '));
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
    if(ents.length===1){
      const comp=dirPath+ents[0];
      const node=dir.children[ents[0]];
      const suffix=node instanceof VDirectory?'/':' ';
      inputElement.value=(before?before+' ':'')+comp+suffix;
    } else if(ents.length>1){ this.print(ents.join('  ')); }
  }

  runCommand(rawInput){
    const input=rawInput.trim();
    if(!input) return;
    this.print(`${this.prompt()} ${input}`);

    if(this.commandHistory[this.commandHistory.length-1]!==input){ 
      this.commandHistory.push(input);
    }

    if(this.editor.isActive){ this._editorHandle(input); return; }
    if(this.rps.isActive){ this._rpsHandle(input); return; }

    if(input.startsWith('!')){
      const idx=parseInt(input.slice(1),10)-1;
      const cmd=this.commandHistory[idx];
      if(cmd) this.runCommand(cmd);
      else this.print('bash: history: invalid index');
      return;
    }

    if(this.addons.active && this.addons.handle){
      this.addons.handle(input);
      return;
    }

    const parts=input.match(/(?:[^\s\"]+|\"[^\"]*\")+/g)||[];
    const name=(parts.shift()||'').replace(/\"/g,'').toLowerCase();
    const args=parts.map(a=>a.replace(/\"/g,''));
    const cmd=this.commands[name];
    if(!cmd){ this.print(`bash: ${name}: command not found`); return; }
    cmd.execute(args,this);
  }

  prompt(){ return `[user@central ${this.vOS.pathOf(this.vOS.cwd)}]$`; }

  _tree(dir=this.vOS.cwd, prefix=''){
    const entries=Object.values(dir.children);
    entries.forEach((child, idx)=>{
      const last=idx===entries.length-1;
      const branch=last?'└── ':'├── ';
      const nextPref=prefix+(last?'    ':'│   ');
      this.print(prefix+branch+child.name+(child.kind==='dir'?'/':''));
      if(child instanceof VDirectory) this._tree(child,nextPref);
    });
  }
}

export { CentralTerminal, VOS, VFile, VDirectory, BootCheck, BootCheckRegistry, Addon };
