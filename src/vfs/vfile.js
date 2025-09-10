import { nowISO } from '../index.js';

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

export { VFile };
