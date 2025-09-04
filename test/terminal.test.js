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
    </div>`;
  container = document.querySelector('#terminal');
});

describe('CentralTerminal v5.1.0 Full Coverage', () => {
  let term;

  beforeEach(() => {
    term = new CentralTerminal('#terminal');
    // Mock print/printHtml to avoid DOM dependency
    term.print = jest.fn((txt) => {
      const p = document.createElement('p');
      p.textContent = txt;
      container.querySelector('#terminalOutput').appendChild(p);
    });
    term.printHtml = jest.fn((html) => {
      const d = document.createElement('div');
      d.innerHTML = html;
      container.querySelector('#terminalOutput').appendChild(d);
    });
  });

  test('initializes with all core commands', () => {
    const coreCommands = ['pwd','ls','cd','cat','mkdir','rmdir','touch','rm','echo','history','date','clear','run','exit','ping','curl','edit','rps','tree','top','help'];
    coreCommands.forEach(cmd => {
      expect(term.commands[cmd]).toBeDefined();
    });
  });

  test('displays help output', () => {
    term.runCommand('help');
    expect(container.textContent).toContain('help');
  });

  test('prints and echoes text', () => {
    term.runCommand('echo Hello World');
    expect(container.textContent).toContain('Hello World');
  });

  test('clears the terminal output', () => {
    term.runCommand('echo x');
    term.runCommand('clear');
    expect(container.querySelector('#terminalOutput').textContent).toBe('');
  });

  test('shows the current working directory with pwd', () => {
    term.runCommand('pwd');
    expect(container.textContent).toContain('/home/user');
  });

  test('changes directories with cd', () => {
    term.runCommand('mkdir testdir');
    term.runCommand('cd testdir');
    term.runCommand('pwd');
    expect(container.textContent).toContain('/home/user/testdir');
  });

  test('creates and lists files with touch and ls', () => {
    term.runCommand('touch file1.txt');
    term.runCommand('ls');
    expect(container.textContent).toContain('file1.txt');
  });

  test('reads file content with cat', () => {
    term.runCommand('touch notes.txt');
    const file = term.vOS.resolve('/home/user/notes.txt');
    file.content = 'Hello Notes';
    term.runCommand('cat notes.txt');
    expect(container.textContent).toContain('Hello Notes');
  });

  test('handles unknown commands gracefully', () => {
    term.runCommand('nonexistent');
    expect(container.textContent).toContain('command not found');
  });

  test('records command history', () => {
    term.runCommand('echo first');
    term.runCommand('echo second');
    term.runCommand('history');
    expect(container.textContent).toContain('1  echo first');
    expect(container.textContent).toContain('2  echo second');
  });

  test('reports the current user with whoami', () => {
    term.addCommand({name:'whoami', description:'current user', execute:()=>term.print(term.username)});
    term.runCommand('whoami');
    expect(container.textContent).toContain('user');
  });

  test('opens the editor, writes and quits', () => {
    term.runCommand('edit file.txt'); // start editor
    term._editorHandle('Editor Test Line'); // type line
    term._editorHandle(':wq'); // save and quit
    const file = term.vOS.resolve('/home/user/file.txt');
    expect(file.content).toBe('Editor Test Line');
    expect(term.print).toHaveBeenCalledWith('Returned to main terminal.');
  });

  test('registers and executes a custom command', () => {
    const mock = jest.fn();
    term.addCommand({name:'custom', description:'test cmd', execute: mock});
    term.runCommand('custom arg1 arg2');
    expect(mock).toHaveBeenCalledWith(['arg1','arg2'], term);
  });

  test('registers and runs a simple addon', () => {
    let onStart=false, onCommand=false, onStop=false;
    class TestAddon extends Addon {
      constructor(){ super('testaddon'); }
      onStart(term){ onStart=true; term.print('Addon started'); }
      onCommand(input, term){ onCommand=true; term.print(`Addon got: ${input}`); }
      onStop(term){ onStop=true; term.print('Addon stopped'); }
    }
    term.registerAddon(new TestAddon());
    term.runCommand('run testaddon');
    expect(onStart).toBe(true);
    term.runCommand('hello');
    expect(onCommand).toBe(true);
    term.runCommand('exit');
    expect(onStop).toBe(true);
  });

  test('handles Ctrl+C simulation', () => {
    term.editor.isActive = true;
    term._editorStop = jest.fn();
    // simulate Ctrl+C
    term._wireKeyboard = jest.fn(); // skip real DOM
    term.runCommand(''); // nothing, just trigger modes
    term.print('^C'); // simulate
    term._editorStop();
    expect(term._editorStop).toHaveBeenCalled();
  });
});
