export class VNode {
    constructor(name) {
        this.name = name;
        this.parent = null;
    }
}

export class VFile extends VNode {
    constructor(name, type, content = '') {
        super(name);
        this.type = type;
        this.content = content;
    }
}

export class VDirectory extends VNode {
    constructor(name) {
        super(name);
        this.children = {};
    }

    addChild(node) {
        node.parent = this;
        this.children[node.name] = node;
    }

    getChild(name) {
        return this.children[name];
    }

    deleteChild(name) {
        delete this.children[name];
    }
}
