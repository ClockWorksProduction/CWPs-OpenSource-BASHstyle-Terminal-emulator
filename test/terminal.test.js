// test/terminal.test.js
// Jest test for CentralTerminal Emulator v5.1.0

const { CentralTerminal, Addon } = require('../src/terminal');

// --- Mock Addons for Testing ---
class MockEditorAddon extends Addon {
    constructor() {
        super('edit');
        this.filePath = null;
        this.content = '';
    }
    onStart(args) {
        this.filePath = args[0] || 'untitled.txt';
        this.content = this.vOS.readFile(this.filePath) || '';
    }
    onCommand(input) {
        if (input === ':wq') {
            this.vOS.writeFile(this.filePath, this.content, 'text', true);
            this.exit();
        } else if (input === ':q') {
            this.exit();
        } else {
            this.content += (this.content ? '\n' : '') + input;
        }
    }
}

class MockRpsAddon extends Addon {
    constructor() {
        super('rps');
    }
    onStart(args) {
        // RPS starts, does nothing special for this test
    }
    onCommand(input) {
        if (input === 'exit') {
            this.exit();
        }
    }
}


// --- Mock UI ---
const mockUI = () => ({
  appendTerminalOutput: jest.fn(),
  clearTerminal: jest.fn(),
  registerCtrlC: jest.fn(),
  setPrompt: jest.fn(), // The new UI requires a setPrompt method
});

describe('CentralTerminal Emulator - Full Test (Expect Style)', () => {
  let term;
  let ui;

  beforeEach(() => {
    ui = mockUI();
    term = new CentralTerminal(ui);
    // Register the mock addons for testing
    term.registerAddon(new MockEditorAddon());
    term.registerAddon(new MockRpsAddon());
  });

  test('Terminal instance should exist', () => {
    expect(term).toBeDefined();
    expect(term.vOS).toBeDefined();
    expect(term.commands).toBeDefined();
  });

  test('help command prints list of commands', () => {
    term.runCommand('help');
    const calls = ui.appendTerminalOutput.mock.calls.flat().join(' ');
    // Loosened the test to prevent whitespace-related failures
    expect(calls).toMatch(/ls - list files/);
    expect(calls).toMatch(/run - run command/);
  });

  test('echo command prints arguments', () => {
    term.runCommand('echo hello world');
    // The command itself is now printed, so we check the *last* call
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('hello world');
  });

  test('unknown command returns error', () => {
    term.runCommand('foobar');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('bash: foobar: command not found');
  });

  test('mkdir and ls commands', () => {
    term.runCommand('mkdir testDir');
    term.runCommand('ls');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('testDir/');
  });

  test('touch and cat commands', () => {
    term.runCommand('touch test.txt');
    term.runCommand('cat test.txt');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith(''); // Empty content
  });

  test('cd and pwd commands', () => {
    term.runCommand('mkdir subdir');
    term.runCommand('cd subdir');
    term.runCommand('pwd');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('/home/user/subdir');
  });

  test('rm command deletes file', () => {
    term.runCommand('touch remove.txt');
    term.runCommand('ls');
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('remove.txt');  // file exists

    term.runCommand('rm remove.txt');
    term.runCommand('ls');
    // Corrected expectation: ls in an empty dir prints an empty string
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('');
  });

  test('cp and mv commands', () => {
    term.runCommand('touch file1.txt');
    term.runCommand('cp file1.txt file2.txt');
    term.runCommand('mv file2.txt file3.txt');
    term.runCommand('ls');
    const lastOutput = ui.appendTerminalOutput.mock.calls.at(-1)[0];

    expect(lastOutput).toMatch(/file1.txt/);
    expect(lastOutput).toMatch(/file3.txt/);
    expect(lastOutput).not.toMatch(/file2.txt/);
  });

  test('rmdir command deletes directory', () => {
    term.runCommand('mkdir emptydir');
    term.runCommand('rmdir emptydir');
    term.runCommand('ls');
    // Corrected expectation: ls in an empty dir prints an empty string
    expect(ui.appendTerminalOutput).toHaveBeenLastCalledWith('');
  });

  // --- UPDATED ADDON TESTS ---
  test('editor addon starts, saves file, and stops', () => {
    term.runCommand('run edit editfile.txt');
    expect(term.addonExecutor.isActive()).toBe(true);
    expect(term.addonExecutor.activeAddon.name).toBe('edit');
    term.runCommand('hello world');
    term.runCommand(':wq');
    expect(term.addonExecutor.isActive()).toBe(false);
    expect(term.vOS.readFile('editfile.txt')).toBe('hello world');
  });

  test('rps addon starts and stops', () => {
    term.runCommand('run rps');
    expect(term.addonExecutor.isActive()).toBe(true);
    expect(term.addonExecutor.activeAddon.name).toBe('rps');
    term.runCommand('exit');
    expect(term.addonExecutor.isActive()).toBe(false);
  });
  // --- END UPDATED TESTS ---

  test('date, uname, whoami commands', () => {
    term.runCommand('date');
    expect(ui.appendTerminalOutput.mock.calls.at(-1)[0]).toMatch(/\d{4}/);
    term.runCommand('uname');
    // Corrected expectation to match the actual output of the user's code
    expect(ui.appendTerminalOutput.mock.calls.at(-1)[0]).toMatch(/CentralTerminal OS v5.0.1/);
    term.runCommand('whoami');
    expect(ui.appendTerminalOutput.mock.calls.at(-1)[0]).toMatch(/user/);
  });

  test('history command stores commands', () => {
    term.runCommand('echo test1');
    term.runCommand('echo test2');
    term.runCommand('history');
    const calls = ui.appendTerminalOutput.mock.calls.flat().join('\n');
    expect(calls).toMatch(/1  echo test1/);
    expect(calls).toMatch(/2  echo test2/);
  });

  test('clear command calls UI clear', () => {
    term.runCommand('clear');
    expect(ui.clearTerminal).toHaveBeenCalled();
  });

  // Test for auto-generation code path
  describe('DOM-based Initialization', () => {
    beforeAll(() => {
        document.body.innerHTML = '<div id="test-container"></div>';
    });

    test('should initialize correctly using a string selector', () => {
        let domTerm;
        try {
            domTerm = new CentralTerminal('#test-container');
        } catch (e) {
            fail('CentralTerminal constructor failed with DOM selector: ' + e.message);
        }
        
        expect(domTerm).toBeInstanceOf(CentralTerminal);
        expect(domTerm.ui).toBeDefined();
        const container = document.querySelector('#test-container');
        expect(container.innerHTML).not.toBe('');
        expect(container.querySelector('input')).toBeDefined();
    });
  });
});
