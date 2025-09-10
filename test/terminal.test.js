// test/terminal.test.js
// Comprehensive test suite for CentralTerminal v5.1.3
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

import {
  CentralTerminal,
  VOS,
  VFile,
  VDirectory,
  Addon,
  EditorAddon,
  RpsAddon,
  TerminalUI
} from '../src/index.js';

// --- Mock UI ---
const mockUI = () => ({
  appendTerminalOutput: jest.fn(),
  clearTerminal: jest.fn(),
  registerCtrlC: jest.fn(),
  setPrompt: jest.fn(),
  input: {
    value: '',
    focus: jest.fn(), // FIX: Add a mock focus function
  },
  output: { // FIX: Add a mock output object for commands like 'aafire'
    innerHTML: '',
    appendChild: jest.fn(),
    scrollTop: 0,
    scrollHeight: 0,
  },
  prompt: {
      innerHTML: ''
  }
});

// --- Mock localStorage ---
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});


describe('VOS (Virtual Operating System)', () => {
  let vos;
  beforeEach(() => {
    vos = new VOS();
  });

  test('should initialize with a home directory', () => {
    expect(vos.cwd).toBeDefined();
    expect(vos.pathOf(vos.cwd)).toBe('/home/user');
  });

  test('normalize should handle complex paths', () => {
    vos.chdir('/home');
    expect(vos.normalize('..')).toBe('/');
    expect(vos.normalize('./user/../user/./test')).toBe('/home/user/test');
    expect(vos.normalize('~/documents')).toBe('/home/user/documents');
    expect(vos.normalize('/a//b/../c')).toBe('/a/c');
  });

  test('mkdir and rmdir should manage directories', () => {
    expect(vos.mkdir('/home/user/test-dir')).toBe(true);
    const dir = vos.resolve('/home/user/test-dir');
    expect(dir).toBeInstanceOf(VDirectory);
    expect(vos.rmdir('/home/user/test-dir')).toBe(true);
    expect(vos.resolve('/home/user/test-dir')).toBeNull();
  });

  test('rmdir should fail on a non-empty directory', () => {
    vos.mkdir('/test-non-empty');
    vos.writeFile('/test-non-empty/file.txt', 'content');
    expect(vos.rmdir('/test-non-empty')).toBe(false);
  });


  test('writeFile and readFile should manage file content', () => {
    const path = '/home/user/test.txt';
    const content = 'hello world';
    vos.writeFile(path, content);
    const file = vos.resolve(path);
    expect(file).toBeInstanceOf(VFile);
    expect(vos.readFile(path)).toBe(content);
  });

  test('unlink should remove a file', () => {
    const path = '/home/user/file-to-delete.txt';
    vos.writeFile(path, 'delete me');
    expect(vos.resolve(path)).not.toBeNull();
    vos.unlink(path);
    expect(vos.resolve(path)).toBeNull();
  });

  test('ls should list directory contents', () => {
    vos.mkdir('/home/user/dir1');
    vos.writeFile('/home/user/file1.txt', '');
    const contents = vos.ls('/home/user');
    expect(contents).toEqual(['dir1/', 'file1.txt']);
  });

  test('chdir should change the current working directory', () => {
    vos.mkdir('/new-dir');
    vos.chdir('/new-dir');
    expect(vos.pathOf(vos.cwd)).toBe('/new-dir');
  });

  test('serialization and deserialization should work', () => {
    vos.writeFile('/a.txt', 'test');
    const json = vos.toJSON();
    const newVos = VOS.fromJSON(json);
    expect(newVos.readFile('/a.txt')).toBe('test');
    expect(newVos.pathOf(newVos.cwd)).toBe('/home/user');
  });
});


describe('Addon System', () => {
  let term;
  let ui;
  beforeEach(() => {
    ui = mockUI();
    term = new CentralTerminal(ui);
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
  });

  test('should register addons', () => {
    expect(term.addonExecutor.registered['edit']).toBeInstanceOf(EditorAddon);
    expect(term.addonExecutor.registered['rps']).toBeInstanceOf(RpsAddon);
  });

  test('run command should start an addon', async () => {
    await term.runCommand('run rps');
    expect(term.addonExecutor.isActive()).toBe(true);
    expect(term.addonExecutor.activeAddon.name).toBe('rps');
    const output = ui.appendTerminalOutput.mock.calls.flat().join('\n');
    expect(output).toContain('--- Rock, Paper, Scissors ---');
  });

  test('EditorAddon should edit a file', async () => {
    await term.runCommand('edit test.txt');
    expect(term.addonExecutor.activeAddon.name).toBe('edit');
    await term.runCommand('a new line');
    await term.runCommand(':wq'); // Save and quit
    expect(term.vOS.readFile('test.txt')).toBe('a new line');
    expect(term.addonExecutor.isActive()).toBe(false);
  });

  test('RpsAddon should play a game', async () => {
    await term.runCommand('rps');
    await term.runCommand('rock');
    const output = ui.appendTerminalOutput.mock.calls.flat().join('\n');
    expect(output).toMatch(/You: rock \| Computer:/);
  });
});

describe('TerminalUI', () => {
  beforeEach(() => {
    // Set up a DOM container
    document.body.innerHTML = '<div id="terminal-container"></div>';
  });

  test('should auto-generate its DOM elements', () => {
    const ui = new TerminalUI('#terminal-container', () => {});
    expect(ui.container.querySelector('input')).not.toBeNull();
    expect(ui.container.querySelector('span')).not.toBeNull();
  });

  test('should use provided DOM elements if selectors are given', () => {
    document.body.innerHTML = `
      <div id="term-manual">
        <div class="output"></div>
        <span class="prompt"></span>
        <input class="input" type="text" />
      </div>
    `;
    const options = {
      outputSelector: '.output',
      promptSelector: '.prompt',
      inputSelector: '.input',
    };
    const ui = new TerminalUI('#term-manual', () => {}, null, options);
    // Check that it DID NOT create new elements
    expect(ui.container.querySelectorAll('input').length).toBe(1);
    expect(ui.input.className).toBe('input');
  });
});


describe('CentralTerminal Core Functionality', () => {
  let term;
  let ui;

  beforeEach(() => {
    mockLocalStorage.clear();
    ui = mockUI();
    term = new CentralTerminal(ui);
  });

  test('boot should load from localStorage', async () => {
    const vosState = {
      root: {
        kind: 'dir',
        name: '',
        children: {
          'test.txt': {
            kind: 'file',
            name: 'test.txt',
            content: 'saved'
          }
        }
      },
      cwd: '/',
      homePath: '/'
    };
    mockLocalStorage.setItem('cterm_vos', JSON.stringify(vosState));
    mockLocalStorage.setItem('cterm_history', JSON.stringify(['ls', 'pwd']));

    await term.boot();
    expect(term.vOS.readFile('/test.txt')).toBe('saved');
    expect(term.commandHistory).toEqual(['ls', 'pwd']);
  });

  test('autocomplete should suggest commands', () => {
    term.ui.input.value = 'he';
    term._autoComplete();
    const output = ui.appendTerminalOutput.mock.calls.flat().join('\n');
    expect(output).toContain('head');
    expect(output).toContain('help');
  });

  test('autocomplete should complete a unique command', () => {
    term.ui.input.value = 'cle';
    term._autoComplete();
    expect(term.ui.input.value).toBe('clear ');
  });
});

describe('CentralTerminal Command Suite', () => {
  let term;
  let ui;

  beforeEach(() => {
    ui = mockUI();
    term = new CentralTerminal(ui);
    term.registerAddon(new EditorAddon());
    term.registerAddon(new RpsAddon());
    // Suppress console.error for tests that expect addon registration errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  // --- Filesystem Commands ---
  test('ls: lists directory contents', () => {
    term.runCommand('touch file.txt');
    term.runCommand('mkdir dir');
    term.runCommand('ls');
    const output = ui.appendTerminalOutput.mock.calls.flat().join(' ');
    expect(output).toContain('file.txt');
    expect(output).toContain('dir/');
  });

  test('cd: changes directory and pwd confirms it', () => {
    term.runCommand('mkdir testdir');
    term.runCommand('cd testdir');
    term.runCommand('pwd');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('/home/user/testdir');
    term.runCommand('cd ..');
    term.runCommand('pwd');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('/home/user');
  });

  test('cat: prints file contents', () => {
    term.vOS.writeFile('test.txt', 'hello from cat');
    term.runCommand('cat test.txt');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('hello from cat');
  });

  test('mkdir: creates a directory', () => {
    term.runCommand('mkdir newdir');
    expect(term.vOS.resolve('newdir').kind).toBe('dir');
  });
  
  test('touch: creates an empty file', () => {
    term.runCommand('touch newfile.txt');
    expect(term.vOS.resolve('newfile.txt').kind).toBe('file');
    expect(term.vOS.readFile('newfile.txt')).toBe('');
  });

  test('rm: removes a file', () => {
    term.runCommand('touch tobedeleted.txt');
    term.runCommand('rm tobedeleted.txt');
    expect(term.vOS.resolve('tobedeleted.txt')).toBeNull();
  });

  test('rmdir: removes an empty directory', () => {
    term.runCommand('mkdir emptydir');
    term.runCommand('rmdir emptydir');
    expect(term.vOS.resolve('emptydir')).toBeNull();
  });

  test('cp: copies a file', () => {
    term.vOS.writeFile('source.txt', 'copy me');
    term.runCommand('cp source.txt dest.txt');
    expect(term.vOS.readFile('dest.txt')).toBe('copy me');
  });

  test('mv: moves/renames a file', () => {
    term.vOS.writeFile('initial.txt', 'move me');
    term.runCommand('mv initial.txt final.txt');
    expect(term.vOS.resolve('initial.txt')).toBeNull();
    expect(term.vOS.readFile('final.txt')).toBe('move me');
  });
  
  test('head: shows first N lines of a file', () => {
    term.vOS.writeFile('lines.txt', '1\n2\n3\n4\n5');
    term.runCommand('head lines.txt 2');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('1\n2');
  });

  test('tail: shows last N lines of a file', () => {
    term.vOS.writeFile('lines.txt', '1\n2\n3\n4\n5');
    term.runCommand('tail lines.txt 2');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('4\n5');
  });
  
  test('tree: shows the directory structure', () => {
    term.runCommand('mkdir -p dir1/subdir1');
    term.runCommand('touch dir1/file1.txt');
    term.runCommand('tree dir1');
    const output = ui.appendTerminalOutput.mock.calls.flat().join('\n');
    expect(output).toContain('dir1');
    // Corrected order based on alphabetical sort
    expect(output).toContain('├── file1.txt');
    expect(output).toContain('└── subdir1/');
  });

  test('grep: searches for a pattern in a file', () => {
    term.vOS.writeFile('search.txt', 'hello world\nfind me\nhello again');
    term.runCommand('grep me search.txt');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('find me');
  });

  // --- Addon and Execution Commands ---
  test('run: runs a registered addon', async () => {
    await term.runCommand('run rps');
    expect(term.addonExecutor.isActive()).toBe(true);
    expect(term.addonExecutor.activeAddon.name).toBe('rps');
  });
  
  test('edit: alias for "run edit"', async () => {
    await term.runCommand('edit file.txt');
    expect(term.addonExecutor.isActive()).toBe(true);
    expect(term.addonExecutor.activeAddon.name).toBe('edit');
    expect(term.addonExecutor.activeAddon.filePath).toBe('/home/user/file.txt');
  });

  test('vim: alias for "run edit"', async () => {
    await term.runCommand('vim file.txt');
    expect(term.addonExecutor.isActive()).toBe(true);
    expect(term.addonExecutor.activeAddon.name).toBe('edit');
  });
  
  test('rps: alias for "run rps"', async () => {
    await term.runCommand('rps');
    expect(term.addonExecutor.isActive()).toBe(true);
    expect(term.addonExecutor.activeAddon.name).toBe('rps');
  });

  // --- System Info Commands ---
  test('date: prints the current date', async () => {
    await term.runCommand('date');
    expect(ui.appendTerminalOutput.mock.calls.at(-1)[0]).toMatch(/\d{4}/);
  });
  
  test('uname: prints system information', async () => {
    await term.runCommand('uname');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith(`CentralTerminal OS v${term.version}`);
  });
  
  test('whoami: prints the current user', async () => {
    await term.runCommand('whoami');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('user');
  });

  test('history: shows command history', async () => {
    await term.runCommand('cmd1');
    await term.runCommand('cmd2');
    await term.runCommand('history');
    const output = ui.appendTerminalOutput.mock.calls.flat().join('\n');
    expect(output).toMatch(/1\s+cmd1/);
    expect(output).toMatch(/2\s+cmd2/);
  });

  test('clear: clears the terminal', async () => {
    await term.runCommand('clear');
    expect(ui.clearTerminal).toHaveBeenCalled();
  });
  
  test('exit: prints an exit message', async () => {
    await term.runCommand('exit');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('Exiting terminal...');
  });

  // --- Utility Commands ---
  test('echo: prints its arguments', async () => {
    await term.runCommand('echo hello there');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('hello there');
  });

  test('help: prints the help message', async () => {
    await term.runCommand('help');
    const output = ui.appendTerminalOutput.mock.calls.flat().join('\n');
    expect(output).toContain('Available commands');
    expect(output).toMatch(/ls\s+- list files/);
  });
  
  // --- Mocked Commands ---
  const mockedCommands = {
    chgrp: 'chgrp: group change simulated',
    chmod: 'chmod: permission change simulated',
    chown: 'chown: ownership simulated',
    curl: 'curl: fetched http://example.com',
    df: '/dev/vfs',
    du: './docs',
    find: 'find: not implemented',
    free: 'Mem: 1024MB total',
    kill: 'kill: simulated',
    ln: 'ln: symbolic links not implemented',
    pgrep: 'pgrep: simulated',
    ping: 'PING localhost',
    pkill: 'pkill: simulated',
    ps: 'PID TTY TIME CMD',
    top: 'Top: simulated',
    umask: '022',
    uptime: 'up 1 day',
  };

  for (const [cmd, expected] of Object.entries(mockedCommands)) {
    test(`${cmd}: runs the mocked command`, async () => {
      await term.runCommand(cmd);
      const output = ui.appendTerminalOutput.mock.calls.flat().join(' ');
      expect(output).toContain(expected);
    });
  }

  // --- Visual/Async Commands ---
  test('aafire: starts and stops', async () => {
    let stopFire;
    ui.registerCtrlC.mockImplementation(fn => {
      stopFire = fn;
    });
    
    const firePromise = term.runCommand('aafire');
    expect(ui.appendTerminalOutput).toHaveBeenCalledWith('Starting ASCII fire... Press Ctrl+C to stop.');
    
    // Simulate stopping it
    expect(typeof stopFire).toBe('function');
    stopFire();
    
    await firePromise;
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('ASCII fire stopped.');
    expect(ui.registerCtrlC).toHaveBeenCalledWith(null);
  });

  test('cmatrix: starts and stops', async () => {
    let stopMatrix;
    ui.registerCtrlC.mockImplementation(fn => {
      stopMatrix = fn;
    });

    const matrixPromise = term.runCommand('cmatrix');
    expect(ui.appendTerminalOutput).toHaveBeenCalledWith('Starting Matrix... Press Ctrl+C to stop.');

    expect(typeof stopMatrix).toBe('function');
    stopMatrix();

    await matrixPromise;
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('Matrix stopped.');
    expect(ui.registerCtrlC).toHaveBeenCalledWith(null);
  });
});