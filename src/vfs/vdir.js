class VDirectory {
    constructor(name) {
      this.kind = 'dir';
      this.name = name;
      this.children = {};
    }
    getChild(name) { return this.children[name]; }
}

export { VDirectory };
