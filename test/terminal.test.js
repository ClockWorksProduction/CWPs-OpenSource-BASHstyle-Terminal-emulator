import { CentralTerminal, Command, Addon } from '../src/terminal.js';

describe('CentralTerminal v4.1.0', () => {
    let term;
    let container;

    beforeEach(() => {
        // Set up a container for the terminal before each test
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
        term.boot(); // Boot the terminal to initialize it
    });

    afterEach(() => {
        // Clean up the DOM
        document.body.innerHTML = '';
        term = null;
        container = null;
    });

    it("should initialize with core commands", () => {
        const coreCommands = ['help', 'echo', 'clear', 'ls', 'cat', 'cd', 'pwd', 'touch', 'run', 'exit'];
        coreCommands.forEach(cmd => {
            expect(term.commands[cmd]).toBeDefined();
        });
    });

    it("should print output to the terminal", () => {
        term.print('Hello, Tester!');
        expect(container.textContent).toContain('Hello, Tester!');
    });

    it("should clear the terminal output", () => {
        term.print('Some initial text');
        term.clear();
        expect(container.querySelector('#terminalOutput').textContent).toBe('');
    });

    it("should execute the 'pwd' command", async () => {
        await term.runCommand('pwd');
        expect(container.textContent).toContain('/C/Users/user');
    });

    it("should create a file with 'touch' and list it with 'ls'", async () => {
        await term.runCommand('touch my-test-file.txt');
        await term.runCommand('ls');
        expect(container.textContent).toContain('my-test-file.txt');
    });

    it("should handle unknown commands gracefully", async () => {
        await term.runCommand('nonexistent-command');
        expect(container.textContent).toContain('Command not recognized: nonexistent-command');
    });

    it("should register and execute a custom command", async () => {
        const customCommand = new Command('greet', 'Greets a user', (args) => term.print(`Greetings, ${args[0] || 'stranger'}!`));
        term.addCommand(customCommand);
        await term.runCommand('greet Jupiter');
        expect(container.textContent).toContain('Greetings, Jupiter!');
    });

    it("should register and run a simple addon", async () => {
        let onStartCalled = false;
        let onCommandCalled = false;
        let onStopCalled = false;

        class SimpleAddon extends Addon {
            constructor() {
                super('simple');
            }
            onStart(term) {
                onStartCalled = true;
                term.print('SimpleAddon started');
            }
            onCommand(input, term) {
                onCommandCalled = true;
                term.print(`Addon got: ${input}`);
            }
            onStop(term) {
                onStopCalled = true;
                term.print('SimpleAddon stopped');
            }
        }

        term.registerAddon(new SimpleAddon());
        await term.runCommand('run simple');
        expect(onStartCalled).toBe(true);
        expect(container.textContent).toContain('SimpleAddon started');

        // Commands are now handled by the addon
        await term.runCommand('test-input');
        expect(onCommandCalled).toBe(true);
        expect(container.textContent).toContain('Addon got: test-input');

        // Exit the addon
        await term.runCommand('exit');
        expect(onStopCalled).toBe(true);
        expect(container.textContent).toContain('SimpleAddon stopped');
        expect(term.addonExecutor.activeAddon).toBeNull();
    });
});
