const { CentralTerminal, Command, Addon } = require('../src/terminal.js');

describe('CentralTerminal', () => {
  let container, output, input;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'terminal-container';
    output = document.createElement('div');
    output.id = 'terminalOutput';
    input = document.createElement('input');
    input.id = 'terminal-command-input';
    container.appendChild(output);
    container.appendChild(input);
    document.body.appendChild(container);

    // BIOS and pseudo-terminal mocks
    const biosScreen = document.createElement('div');
    biosScreen.id = 'bios-screen';
    document.body.appendChild(biosScreen);
    const biosOutput = document.createElement('div');
    biosOutput.id = 'bios-output';
    document.body.appendChild(biosOutput);
    const pseudoTerminal = document.createElement('div');
    pseudoTerminal.id = 'pseudo-terminal';
    document.body.appendChild(pseudoTerminal);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize with default commands', () => {
    const term = new CentralTerminal('#terminal-container');
    expect(Object.keys(term.commands)).toEqual(
      expect.arrayContaining(['pwd', 'ls', 'cd', 'cat', 'touch', 'help', 'run', 'exit'])
    );
  });

  it('should print output', () => {
    const term = new CentralTerminal('#terminal-container');
    term.print('Hello World');
    expect(output.textContent.trim()).toContain('Hello World');
  });

  it('should clear output', () => {
    const term = new CentralTerminal('#terminal-container');
    term.print('Hello');
    term.clear();
    expect(output.textContent).toBe('');
  });

  it('should run pwd command', () => {
    const term = new CentralTerminal('#terminal-container');
    term.runCommand('pwd');
    expect(output.textContent.trim()).toBe('/user');
  });

  it('should create and list files with touch and ls', () => {
    const term = new CentralTerminal('#terminal-container');
    term.runCommand('touch testfile.txt');
    term.runCommand('ls');
    expect(output.textContent).toContain('testfile.txt');
  });

  it('should change directory with cd', () => {
    const term = new CentralTerminal('#terminal-container');
    term.runCommand('cd /home');
    term.runCommand('pwd');
    expect(output.textContent).toContain('/home');
  });

  it('should show error for unknown command', () => {
    const term = new CentralTerminal('#terminal-container');
    term.runCommand('foobar');
    expect(output.textContent).toContain('Command not recognized: foobar.');
  });

  it('should add and execute a custom command', () => {
    const term = new CentralTerminal('#terminal-container');
    const customCmd = new Command('greet', 'Greet user', { action: (args) => term.print(`Hello, ${args[0] || 'stranger'}!`) });
    term.addCommand(customCmd);
    term.runCommand('greet Copilot');
    expect(output.textContent).toContain('Hello, Copilot!');
  });

  it('should add and run a boot check', async () => {
    const term = new CentralTerminal('#terminal-container');
    const bootCheck = {
      name: 'TestCheck',
      check: () => Promise.resolve(true),
      description: 'A test boot check'
    };
    term.addBootCheck(bootCheck);
    await term.boot();
    expect(document.getElementById('bios-output').innerHTML).toContain('Booting complete.');
  });

  it('should register and run an addon', () => {
    const term = new CentralTerminal('#terminal-container');
    class TestAddon extends Addon {
      onStart(term) { term.print('Addon started'); }
      onCommand(input) { term.print(`Addon received: ${input}`); }
      onStop() { }
    }
    const addon = new TestAddon('testaddon');
    term.registerAddon(addon);
    term.runCommand('run testaddon');
    expect(output.textContent).toContain('Addon started');
    term.runCommand('hello');
    expect(output.textContent).toContain('Addon received: hello');
    term.runCommand('exit');
    expect(output.textContent).toContain('Returned to main terminal.');
  });
});

describe('Command', () => {
  it('should create a command with function', () => {
    const cmd = new Command('test', 'desc', () => {});
    expect(cmd.name).toBe('test');
    expect(cmd.description).toBe('desc');
    expect(typeof cmd.action).toBe('function');
  });

  it('should create a command with action object', () => {
    const cmd = new Command('test', 'desc', { action: () => 'ok' });
    expect(typeof cmd.action).toBe('function');
    expect(cmd.action()).toBe('ok');
  });
});

describe('Addon', () => {
  it('should instantiate Addon and call lifecycle methods', () => {
    class MyAddon extends Addon {
      constructor(name) { super(name); this.started = false; }
      onStart(term) { this.started = true; }
      onCommand(input) { this.lastInput = input; }
      onStop() { this.stopped = true; }
    }
    const addon = new MyAddon('myaddon');
    expect(addon.name).toBe('myaddon');
    addon.onStart();
    expect(addon.started).toBe(true);
    addon.onCommand('foo');
    expect(addon.lastInput).toBe('foo');
    addon.onStop();
    expect(addon.stopped).toBe(true);
  });
});