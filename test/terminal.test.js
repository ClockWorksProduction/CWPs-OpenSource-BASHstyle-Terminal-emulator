// We recommend installing an extension to run jest tests.
import { CentralTerminal, Addon, Command } from '../src/terminal.js';

describe('CentralTerminal', () => {
  let container, output, input;

  beforeEach(() => {
    // Mock DOM elements
    container = document.createElement('div');
    container.id = 'terminal-container';
    output = document.createElement('div');
    output.id = 'terminalOutput';
    input = document.createElement('input');
    input.id = 'terminal-command-input';
    container.appendChild(output);
    container.appendChild(input);
    document.body.appendChild(container);

    // Mock BIOS and pseudo-terminal screens
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
    expect(Object.keys(term.commands)).toContain('pwd');
    expect(Object.keys(term.commands)).toContain('ls');
    expect(Object.keys(term.commands)).toContain('cd');
    expect(Object.keys(term.commands)).toContain('cat');
    expect(Object.keys(term.commands)).toContain('help');
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
