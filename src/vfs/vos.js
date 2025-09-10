import { VDirectory } from './vdir.js';
import { VFile } from './vfile.js';

class VOS {
  constructor(seed = true) {
    this.root = new VDirectory('/');
    this.homePath = '/home/user';
    if (seed) {
      this._seed();
    }
    this.cwd = this.resolve(this.homePath) || this.root;
  }

  _seed() {
    this._mkdirp(this.homePath);
    this.mkdir('/bin');
    this.mkdir('/etc');
    this.mkdir('/docs');
    this.writeFile('/etc/motd', 'Welcome to the Central Terminal!\n');
    this.writeFile('/docs/guide.txt', '# Welcome to the Virtual File System!\n');
  }

  _mkdirp(path) {
    const parts = this.normalize(path).split('/').filter(Boolean);
    let currentNode = this.root;
    for (const part of parts) {
      if (!currentNode.children[part]) {
        currentNode.children[part] = new VDirectory(part);
      }
      currentNode = currentNode.children[part];
      if (!(currentNode instanceof VDirectory)) {
        return undefined;
      }
    }
    return currentNode;
  }

  static fromJSON(json) {
    const vos = new VOS(false);
    const sortedPaths = Object.keys(json).sort((a, b) => a.localeCompare(b));
    for (const path of sortedPaths) {
      const obj = json[path];
      if (!obj || (obj.type !== 'file' && obj.kind !== 'file')) {
        continue;
      }
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      const fileName = path.substring(path.lastIndexOf('/') + 1);
      if (!fileName) {
        continue;
      }
      const parentNode = vos._mkdirp(parentPath);
      if (!parentNode) {
        continue;
      }
      parentNode.children[fileName] = new VFile(fileName, obj.content, obj.ftype || 'text');
    }
    vos.cwd = vos.resolve(vos.homePath) || vos.root;
    return vos;
  }

  toJSON() {
    const result = {};
    const traverse = (node, path) => {
      if (path !== '/') {
        result[path] = node.toJSON ? node.toJSON() : { type: node.kind, content: node.content, ftype: node.ftype };
      }
      
      if (node instanceof VDirectory) {
        for (const childName in node.children) {
          const childNode = node.children[childName];
          const newPath = path === '/' ? '/' + childName : path + '/' + childName;
          traverse(childNode, newPath);
        }
      }
    };
    traverse(this.root, '/');
    return result;
  }

  normalize(path) {
    if (!path) return this.pathOf(this.cwd);
    if (path.startsWith('~')) path = path.replace('~', this.homePath);
    const isAbsolutePath = path.startsWith('/');
    const basePath = isAbsolutePath ? '' : this.pathOf(this.cwd);
    const fullPath = isAbsolutePath ? path : (basePath === '/' ? '/' : basePath + '/') + path;
    const parts = fullPath.split('/');
    const stack = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') {
        if (stack.length > 0) stack.pop();
      } else {
        stack.push(part);
      }
    }
    return '/' + stack.join('/');
  }

  resolve(path) {
    const norm = this.normalize(path);
    if (norm === '/') return this.root;
    const segs = norm.split('/').filter(Boolean);
    let cur = this.root;
    for (const s of segs) {
      if (!(cur instanceof VDirectory) || !cur.children[s]) {
        return undefined;
      }
      cur = cur.children[s];
    }
    return cur;
  }
  
  parentOf(path) {
    const norm = this.normalize(path);
    if (norm === '/') return undefined;
    const parentPath = norm.substring(0, norm.lastIndexOf('/')) || '/';
    return this.resolve(parentPath);
  }

  pathOf(node) {
    if (!node || node === this.root) return '/';
    const find = (dir, target, path) => {
      for (const childName in dir.children) {
        const childNode = dir.children[childName];
        const fullPath = path === '/' ? '/' + childName : path + '/' + childName;
        if (childNode === target) return fullPath;
        if (childNode instanceof VDirectory) {
          const found = find(childNode, target, fullPath);
          if (found) return found;
        }
      }
      return undefined;
    };
    return find(this.root, node, '/');
  }

  mkdir(path) {
    const norm = this.normalize(path);
    if (this.resolve(norm)) return false;
    const parent = this.parentOf(norm);
    if (!(parent instanceof VDirectory)) return false;
    const name = norm.substring(norm.lastIndexOf('/') + 1);
    parent.children[name] = new VDirectory(name);
    return true;
  }

  writeFile(path, content = '', ftype = 'text', overwrite = true) {
    const norm = this.normalize(path);
    const existing = this.resolve(norm);
    if (existing && !overwrite) return false;
    if (existing instanceof VDirectory) return false;
    
    const parentPath = norm.substring(0, norm.lastIndexOf('/')) || '/';
    const parentNode = this._mkdirp(parentPath);
    if (!parentNode) return false;

    const name = norm.substring(norm.lastIndexOf('/') + 1);
    if (!name) return false;

    parentNode.children[name] = new VFile(name, content, ftype);
    return true;
  }

  rmdir(path) {
    const node = this.resolve(path);
    if (!(node instanceof VDirectory) || Object.keys(node.children).length > 0) return false;
    const parent = this.parentOf(path);
    if (!parent) return false;
    delete parent.children[node.name];
    return true;
  }

  readFile(path) {
    const node = this.resolve(path);
    return (node instanceof VFile) ? node.content : null;
  }

  unlink(path) {
    const node = this.resolve(path);
    if (!(node instanceof VFile)) return false;
    const parent = this.parentOf(path);
    if (!(parent instanceof VDirectory)) return false;
    delete parent.children[node.name];
    return true;
  }

  ls(path = '.') {
    const dir = this.resolve(path);
    if (!(dir instanceof VDirectory)) return null;
    return Object.keys(dir.children).sort();
  }

  chdir(path) {
    const dir = this.resolve(path);
    if (dir instanceof VDirectory) {
      this.cwd = dir;
      return true;
    }
    return false;
  }
}

export { VOS };
