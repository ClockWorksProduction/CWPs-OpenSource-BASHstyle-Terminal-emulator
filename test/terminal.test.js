/**
 * @jest-environment jsdom
 */
import { CentralTerminal, VOS, Addon } from '../src/terminal.js';

let container;

beforeEach(() => {
  // Setup DOM container
  document.body.innerHTML = `
    <div id="terminal">
      <div id="terminalOutput"></div>
      <input id="terminal-command-input" />
    </div>
    <div id="bios-screen" style="display: none;">
      <div id="bios-output"></div>
    </div>
    <div id="pseudo-terminal" style="display: flex;"></div>
  `;
  container = document.querySelector('#terminal');
});

describe('CentralTerminal v5.0.0 Full Coverage', () => {
  let term;

  beforeEach(() => {
    // To reset localStorage between tests
    localStorage.clear();
    term = new CentralTerminal('#terminal');
    // Mock print functions for easier assertion
    term.print = jest.fn();
    term.printHtml = jest.fn();
  });

  test('initializes with all core commands', () => {
    const coreCommands = ['pwd','ls','cd','cat','mkdir','rmdir','touch','rm','echo','history','date','clear','run','exit','ping','curl','edit','rps','tree','top','help','cp','mv','find','uname','whoami','who','uptime'];
    coreCommands.forEach(cmd => {
      expect(term.commands[cmd]).toBeDefined();
    });
  });

  test('displays help output', () => {
    term.runCommand('help');
    // Check if the print function was called with something containing 'help'
    expect(term.print.mock.calls.some(call => call[0].includes('list available commands'))).toBe(true);
  });

  test('prints and echoes text', () => {
    term.runCommand('echo Hello World');
    expect(term.print).toHaveBeenCalledWith('user@central-terminal:~$ echo Hello World');
    expect(term.print).toHaveBeenCalledWith('Hello World');
  });

  test('clears the terminal output', () => {
    term.clear = jest.fn(); // Mock clear
    term.runCommand('clear');
    expect(term.clear).toHaveBeenCalled();
  });

  test('shows the current working directory with pwd', () => {
    term.runCommand('pwd');
    expect(term.print).toHaveBeenCalledWith('/home/user');
  });

  test('changes directories with cd', () => {
    term.runCommand('mkdir testdir');
    term.runCommand('cd testdir');
    term.runCommand('pwd');
    expect(term.print).toHaveBeenLastCalledWith('/home/user/testdir');
  });

  test('creates and lists files with touch and ls', () => {
    term.runCommand('touch file1.txt');
    term.runCommand('ls');
    expect(term.print).toHaveBeenLastCalledWith('file1.txt');
  });

  test('reads file content with cat', () => {
    term.vOS.writeFile('/home/user/notes.txt', 'Hello Notes');
    term.runCommand('cat notes.txt');
    expect(term.print).toHaveBeenCalledWith('Hello Notes');
  });

  test('handles unknown commands gracefully', () => {
    term.runCommand('nonexistent');
    expect(term.print).toHaveBeenLastCalledWith('bash: nonexistent: command not found');
  });

  test('records command history', () => {
    term.runCommand('echo first');
    term.runCommand('echo second');
    term.runCommand('history');
    expect(term.print).toHaveBeenCalledWith('1  echo first');
    expect(term.print).toHaveBeenCalledWith('2  echo second');
  });

  test('reports the current user with whoami (custom command)', () => {
    term.addCommand({name:'whoami', description:'current user', execute:()=>term.print(term.username)});
    term.runCommand('whoami');
    expect(term.print).toHaveBeenLastCalledWith('user');
  });

  test('opens the editor, writes and quits', () => {
    term.runCommand('edit file.txt'); // start editor
    expect(term.editor.isActive).toBe(true);
    term.runCommand('Editor Test Line'); // type line
    term.runCommand(':wq'); // save and quit
    const fileContent = term.vOS.readFile('/home/user/file.txt');
    // The editor prepends a newline to new files, this is expected.
    expect(fileContent).toBe('\nEditor Test Line');
    expect(term.editor.isActive).toBe(false);
    expect(term.print).toHaveBeenCalledWith('Returned to main terminal.');
  });

  test('registers and executes a custom command with args', () => {
    const mock = jest.fn();
    term.addCommand({name:'custom', description:'test cmd', execute: mock});
    term.runCommand('custom arg1 arg2');
    expect(mock).toHaveBeenCalledWith(['arg1','arg2'], term);
  });

  test('registers and runs a simple addon', () => {
    let onStart = false, onCommand = false, onStop = false;
    class TestAddon extends Addon {
        constructor() { super('testaddon'); }
        onStart(term, vOS) {
            this.term = term; // Set term instance for use in other methods
            onStart = true;
            term.print('Addon started');
        }
        onCommand(input) {
            onCommand = true;
            if (input.toLowerCase() === 'exit') {
                // Addons are responsible for handling their own exit command.
                this.term.addons.stop(this.term);
            } else {
                this.term.print(`Addon got: ${input}`);
            }
        }
        onStop() {
            onStop = true;
            this.term.print('Addon stopped');
        }
    }
    term.registerAddon(new TestAddon());
    term.runCommand('run testaddon');
    expect(onStart).toBe(true);
    expect(term.print).toHaveBeenCalledWith('Addon started');

    term.runCommand('hello from addon');
    expect(onCommand).toBe(true);
    expect(term.print).toHaveBeenCalledWith('Addon got: hello from addon');

    term.runCommand('exit');
    expect(onStop).toBe(true);
    expect(term.print).toHaveBeenCalledWith('Addon stopped');
    expect(term.print).toHaveBeenCalledWith('Returned to main terminal.');
  });

  test('handles Ctrl+C to stop active addon', () => {
    // Register and start an addon
    const addon = new Addon('testaddon');
    addon.onStop = jest.fn();
    term.registerAddon(addon);
    term.runCommand('run testaddon');
    expect(term.addons.active).toBe(addon);

    // Simulate Ctrl+C
    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true });
    term.input.dispatchEvent(event);

    // Assertions
    expect(term.print).toHaveBeenCalledWith('^C');
    expect(addon.onStop).toHaveBeenCalled();
    expect(term.addons.active).toBeNull();
    expect(term.print).toHaveBeenCalledWith('Returned to main terminal.');
  });

  test('history navigation with arrow keys', () => {
      term.runCommand('cmd1');
      term.runCommand('cmd2');

      const input = term.input;
      const upArrow = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
      const downArrow = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });

      // Go up in history
      input.dispatchEvent(upArrow);
      expect(input.value).toBe('cmd2');
      input.dispatchEvent(upArrow);
      expect(input.value).toBe('cmd1');

      // Go down in history
      input.dispatchEvent(downArrow);
      expect(input.value).toBe('cmd2');
      input.dispatchEvent(downArrow);
      expect(input.value).toBe('');
  });

  test('autocomplete for commands', () => {
      term.input.value = 'he';
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      term.input.dispatchEvent(tabEvent);
      expect(term.input.value).toBe('help ');
  });

  test('autocomplete for file paths', () => {
      term.runCommand('mkdir my_directory');
      term.input.value = 'cd my_d';
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      term.input.dispatchEvent(tabEvent);
      // Autocomplete provides the full, absolute path.
      expect(term.input.value).toBe('cd /home/user/my_directory/');
  });
});
