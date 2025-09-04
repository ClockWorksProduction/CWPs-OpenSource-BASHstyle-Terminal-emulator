import { CentralTerminal, Addon } from '../src/terminal.js';

describe('CentralTerminal v5.0.0 (full coverage)', () => {
    let term;
    let container;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="test-container">
                <div id="terminalOutput"></div>
                <input id="terminal-command-input" />
            </div>
            <div id="bios-screen"></div>
            <div id="bios-output"></div>
            <div id="pseudo-terminal"></div>
        `;
        container = document.getElementById('test-container');
        term = new CentralTerminal('#test-container');
        term.boot();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        term = null;
        container = null;
    });

    it("should initialize with core commands", () => {
        const coreCommands = [
            'help', 'echo', 'clear', 'ls', 'cat', 'cd', 'pwd',
            'touch', 'run', 'exit', 'history', 'whoami', 'edit'
        ];
        coreCommands.forEach(cmd => {
            expect(term.commands.get(cmd)).toBeDefined();
        });
    });

    it("should display help output", async () => {
        await term.runCommand('help');
        expect(container.textContent).toContain('Available commands:');
        expect(container.textContent).toContain('echo');
    });

    it("should print and echo text", async () => {
        await term.runCommand('echo HelloWorld');
        expect(container.textContent).toContain('HelloWorld');
    });

    it("should clear the terminal output", () => {
        term.print('Some text');
        term.clear();
        expect(container.querySelector('#terminalOutput').textContent).toBe('');
    });

    it("should show the current working directory with pwd", async () => {
        await term.runCommand('pwd');
        expect(container.textContent).toContain('/home/user');
    });

    it("should change directories with cd", async () => {
        await term.runCommand('mkdir projects'); // assuming mkdir exists
        await term.runCommand('cd projects');
        await term.runCommand('pwd');
        expect(container.textContent).toContain('/home/user/projects');
    });

    it("should create and list files with touch and ls", async () => {
        await term.runCommand('touch alpha.txt');
        await term.runCommand('ls');
        expect(container.textContent).toContain('alpha.txt');
    });

    it("should read file content with cat", async () => {
        await term.runCommand('touch notes.txt');
        term.vfs['/home/user/notes.txt'].content = 'Test content';
        await term.runCommand('cat notes.txt');
        expect(container.textContent).toContain('Test content');
    });

    it("should handle unknown commands gracefully", async () => {
        await term.runCommand('foobar');
        expect(container.textContent).toContain('bash: foobar: command not found');
    });

    it("should record command history", async () => {
        await term.runCommand('echo one');
        await term.runCommand('echo two');
        await term.runCommand('history');
        expect(container.textContent).toContain('echo one');
        expect(container.textContent).toContain('echo two');
    });

    it("should report the current user with whoami", async () => {
        await term.runCommand('whoami');
        expect(container.textContent).toContain('user');
    });

    it("should open the editor with edit, write and quit", async () => {
        await term.runCommand('edit file.txt');
        expect(container.textContent).toContain('Opened editor for file.txt');

        // Simulate write
        term.editorBuffer = 'Hello Editor';
        await term.runCommand(':w');
        expect(term.vfs['/home/user/file.txt'].content).toBe('Hello Editor');

        // Quit without saving
        await term.runCommand(':q');
        expect(container.textContent).toContain('Exited editor for file.txt');
    });

    it("should exit the editor with :wq (save and quit)", async () => {
        await term.runCommand('edit testdoc.txt');
        term.editorBuffer = 'Save and quit';
        await term.runCommand(':wq');
        expect(term.vfs['/home/user/testdoc.txt'].content).toBe('Save and quit');
        expect(container.textContent).toContain('Exited editor for testdoc.txt');
    });

    it("should register and execute a custom command", async () => {
        term.addCommand({
            name: 'greet',
            description: 'Greets a user',
            action: (args, termInstance) => {
                termInstance.print(`Greetings, ${args[0] || 'stranger'}!`);
            }
        });

        await term.runCommand('greet Tester');
        expect(container.textContent).toContain('Greetings, Tester!');
    });

    it("should register and run a simple addon", async () => {
        let onStartCalled = false;
        let onCommandCalled = false;
        let onStopCalled = false;

        class SimpleAddon extends Addon {
            constructor() {
                super('simple');
                this.term = null;
            }
            onStart(termInstance) {
                onStartCalled = true;
                this.term = termInstance;
                this.term.print('SimpleAddon started');
            }
            onCommand(input) {
                onCommandCalled = true;
                this.term.print(`Addon got: ${input}`);
            }
            onStop() {
                onStopCalled = true;
                this.term.print('SimpleAddon stopped');
            }
        }

        term.registerAddon(new SimpleAddon());
        await term.runCommand('run simple');
        expect(onStartCalled).toBe(true);
        expect(container.textContent).toContain('SimpleAddon started');

        await term.runCommand('addon-test');
        expect(onCommandCalled).toBe(true);
        expect(container.textContent).toContain('Addon got: addon-test');

        await term.runCommand('exit');
        expect(onStopCalled).toBe(true);
        expect(container.textContent).toContain('SimpleAddon stopped');
        expect(term.addonExecutor.activeAddon).toBeNull();
    });

    it("should handle Ctrl+C simulation", () => {
        const beforeLen = term.history.length;
        term.handleInterrupt(); // simulate Ctrl+C
        expect(term.history.length).toBe(beforeLen + 1);
        expect(container.textContent).toContain('^C');
    });
});
