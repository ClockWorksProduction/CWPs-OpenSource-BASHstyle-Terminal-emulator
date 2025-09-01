export class Command {
    constructor(name, description, execute, aliases = []) {
        this.name = name;
        this.description = description;
        this.execute = execute;
        this.aliases = aliases;
    }
}
