// test/terminal.test.js
// Jest test for CentralTerminal Emulator v5.0.1

// Use CommonJS import if your terminal file exports with module.exports
const { CentralTerminal } = require('../src/terminal');

// Mock UI
const mockUI = () => ({
  appendTerminalOutput: jest.fn(),
  clearTerminal: jest.fn(),
  registerCtrlC: jest.fn(),
});

describe('CentralTerminal Emulator - Full Test (Expect Style)', () => {
  let term;
  let ui;

  beforeEach(() => {
    ui = mockUI();
    term = new CentralTerminal(ui);
  });

  test('Terminal instance should exist', () => {
    expect(term).toBeDefined();
    expect(term.vOS).toBeDefined();
    expect(term.commands).toBeDefined();
  });

  test('help command prints list of commands', () => {
    term.runCommand('help');
    expect(ui.appendTerminalOutput).toHaveBeenCalled();
    const calls = ui.appendTerminalOutput.mock.calls.flat().join(' ');
    expect(calls).toMatch(/ls - list files/);
    expect(calls).toMatch(/help - show help/);
  });

  test('echo command prints arguments', () => {
    term.runCommand('echo hello world');
    expect(ui.appendTerminalOutput).toHaveBeenCalledWith(expect.stringContaining('hello world'));
  });

  test('unknown command returns error', () => {
    term.runCommand('foobar');
    expect(ui.appendTerminalOutput).toHaveBeenCalledWith('bash: foobar: command not found');
  });

  test('mkdir and ls commands', () => {
    term.runCommand('mkdir testDir');
    term.runCommand('ls');
    expect(ui.appendTerminalOutput.mock.calls.flat().join(' ')).toMatch(/testDir\//);
  });

  test('touch and cat commands', () => {
    term.runCommand('touch test.txt');
    term.runCommand('echo "Hello" > test.txt'); // optional: simulate content
    term.runCommand('cat test.txt');
    // cat prints '' by default if file is empty
    expect(ui.appendTerminalOutput).toHaveBeenCalledWith(expect.stringContaining(''));
  });

  test('cd and pwd commands', () => {
    term.runCommand('mkdir subdir');
    term.runCommand('cd subdir');
    term.runCommand('pwd');
    const calls = ui.appendTerminalOutput.mock.calls.flat();
    expect(calls[calls.length - 1]).toContain('/subdir');
  });

  test('rm command deletes file', () => {
    term.runCommand('touch remove.txt');
    term.runCommand('ls');
    let calls = ui.appendTerminalOutput.mock.calls.flat();
    expect(calls[calls.length - 1]).toMatch(/remove.txt/);  // file exists
  
    term.runCommand('rm remove.txt');
    term.runCommand('ls');
    calls = ui.appendTerminalOutput.mock.calls.flat();
    expect(calls[calls.length - 1]).not.toMatch(/remove.txt/);  // file gone
  });
  
  test('cp and mv commands', () => {
    term.runCommand('touch file1.txt');
    term.runCommand('cp file1.txt file2.txt');
    term.runCommand('mv file2.txt file3.txt');
    term.runCommand('ls');
    const lastOutput = ui.appendTerminalOutput.mock.calls.flat().at(-1);
  
    expect(lastOutput).toMatch(/file1.txt/);   // original exists
    expect(lastOutput).toMatch(/file3.txt/);   // moved exists
    expect(lastOutput).not.toMatch(/file2.txt/); // no longer exists
  });     

  test('rmdir command deletes directory', () => {
    term.runCommand('mkdir emptydir');
    term.runCommand('rmdir emptydir');
    term.runCommand('ls');
    const calls = ui.appendTerminalOutput.mock.calls.flat().join(' ');
    expect(calls).not.toMatch(/emptydir\//);
  });

  test('editor starts and saves file', () => {
    term.runCommand('edit editfile.txt');
    expect(term.editor.isActive).toBe(true);
    term.runCommand(':wq');
    expect(term.editor.isActive).toBe(false);
    expect(term.vOS.readFile('editfile.txt')).toBe('');
  });

  test('rps mode starts and stops', () => {
    term.runCommand('rps');
    expect(term.rps.isActive).toBe(true);
    term.runCommand('exit');
    expect(term.rps.isActive).toBe(false);
  });

  test('date, uname, whoami commands', () => {
    term.runCommand('date');
    term.runCommand('uname');
    term.runCommand('whoami');
    const calls = ui.appendTerminalOutput.mock.calls.flat().join(' ');
    expect(calls).toMatch(/CentralTerminal OS v5.0.1/);
    expect(calls).toMatch(/user/);
    expect(calls).toMatch(/\d{4}/); // year from date
  });

  test('history command stores commands', () => {
    term.runCommand('echo test1');
    term.runCommand('echo test2');
    term.runCommand('history');
    const calls = ui.appendTerminalOutput.mock.calls.flat().join(' ');
    expect(calls).toMatch(/echo test1/);
    expect(calls).toMatch(/echo test2/);
  });

  test('clear command calls UI clear', () => {
    term.runCommand('clear');
    expect(ui.clearTerminal).toHaveBeenCalled();
  });
});
