import { VDirectory, VFile } from './filesystem.js';

export class VOS {
    constructor() {
        this.root = new VDirectory('/');
        this.cwd = this.root;
    }

    _resolvePath(path) {
        const segments = path.split('/').filter(s => s);
        let currentNode = path.startsWith('/') ? this.root : this.cwd;

        for (const segment of segments) {
            if (segment === '..') {
                currentNode = currentNode.parent || currentNode;
            } else if (segment !== '.') {
                const nextNode = currentNode.getChild(segment);
                if (!nextNode) return null;
                currentNode = nextNode;
            }
        }
        return currentNode;
    }

    _getFullPath(node) {
        if (node === this.root) return '/';
        let path = '';
        while (node.parent) {
            path = `/${node.name}${path}`;
            node = node.parent;
        }
        return path || '/';
    }

    listFiles(path) {
        const target = this._resolvePath(path || '.');
        if (target instanceof VDirectory) {
            return Object.keys(target.children);
        }
        return [];
    }

    changeDir(path) {
        const newCwd = this._resolvePath(path);
        if (newCwd instanceof VDirectory) {
            this.cwd = newCwd;
            return true;
        }
        return false;
    }

    createDirectory(path) {
        const parts = path.split('/');
        const dirName = parts.pop();
        const parentPath = parts.join('/');
        const parentDir = this._resolvePath(parentPath || '.');

        if (parentDir instanceof VDirectory && dirName && !parentDir.getChild(dirName)) {
            parentDir.addChild(new VDirectory(dirName));
            return true;
        }
        return false;
    }

    createFile(path, type = 'text', content = '') {
        const parts = path.split('/');
        const fileName = parts.pop();
        const parentPath = parts.join('/');
        const parentDir = this._resolvePath(parentPath || '.');

        if (parentDir instanceof VDirectory && fileName && !parentDir.getChild(fileName)) {
            parentDir.addChild(new VFile(fileName, type, content));
            return true;
        }
        return false;
    }

    deleteFile(path) {
        const node = this._resolvePath(path);
        if (node && node.parent) {
            node.parent.deleteChild(node.name);
            return true;
        }
        return false;
    }
}
