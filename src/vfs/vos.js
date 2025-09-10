import { deepClone, nowISO, VDirectory, VFile } from '../index.js';

class VOS {
    constructor() {
      this.root = new VDirectory('');
      this.homePath = '/home/user';
      this._seed(); // Seed first
      this.cwd = this.resolve(this.homePath) || this.root; // FIX: Set cwd AFTER seeding.
    }
  
    // Serialization
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
      vos.cwd = vos.resolve(json.cwd) || vos._mkdirp('/');
      vos.homePath = json.homePath || '/';
      return vos;
    }
  
    // Helpers
    _seed() {
      this.mkdir('/home');
      this.mkdir('/home/user'); // FIX: create user's home directory
      this.mkdir('/bin'); this.mkdir('/etc'); this.mkdir('/docs'); this.mkdir('/media');
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
      return Object.values(dir.children).map(c => c.kind === 'dir' ? c.name + '/' : c.ftype === 'exe' ? c.name + '*' : c.name).sort();
    }
  
    chdir(path) {
      const dir = this.resolve(path);
      if (dir instanceof VDirectory) { this.cwd = dir; return true; }
      return false;
    }
}

export { VOS };
