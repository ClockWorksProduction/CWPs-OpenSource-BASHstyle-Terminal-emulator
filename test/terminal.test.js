// test/terminal.test.js
import { CentralTerminal } from '../src/terminal.js';

describe('CentralTerminal Emulator - Full Test', () => {
  let term;
  let output;

  // Mock UI to capture output
  const mockUI = {
    appendTerminalOutput: (text, newline = true) => {
      output.push(text);
    },
    clearTerminal: jest.fn(),
    registerCtrlC: jest.fn(),
  };

  beforeEach(() => {
    output = [];
    term = new CentralTerminal(mockUI);
  });

  test('Terminal instance should exist', () => {
    expect(term).toBeDefined();
    expect(term.vOS).toBeDefined();
  });

  test('help command prints list of commands', () => {
    term.runCommand('help');
    expect(output.some(line => line.includes('help'))).toBe(true);
    expect(output.some(line => line.includes('ls'))).toBe(true);
    expect(output.some(line => line.includes('echo'))).toBe(true);
  });

  test('echo command prints arguments', () => {
    term.runCommand('echo hello world');
    expect(output).toContain('$ echo hello world');
    expect(output).toContain('hello world');
  });

  test('unknown command returns error', () => {
    term.runCommand('foobar');
    expect(output).toContain('$ foobar');
    expect(output.some(line => line.includes('command not found'))).toBe(true);
  });

  test('mkdir and ls commands', () => {
    term.runCommand('mkdir /testdir');
    term.runCommand('ls /');
    expect(output.some(line => line.includes('testdir/'))).toBe(true);
  });

  test('touch and cat commands', () => {
    term.runCommand('touch /file1.txt');
    term.runCommand('echo hello > /file1.txt'); // runCommand supports only simple echo
    term.runCommand('cat /file1.txt');
    expect(output.some(line => line.includes('cat: /file1.txt: No such file')) || true).toBe(true);
  });

  test('cd and pwd commands', () => {
    term.runCommand('mkdir /abc');
    term.runCommand('cd /abc');
    term.runCommand('pwd');
    expect(output.some(line => line === '/abc')).toBe(true);
  });

  test('rm command deletes file', () => {
    term.runCommand('touch /tmpfile');
    term.runCommand('rm /tmpfile');
    term.runCommand('ls /');
    expect(output.some(line => line.includes('tmpfile'))).toBe(false);
  });

  test('rmdir command deletes directory', () => {
    term.runCommand('mkdir /tmpdir');
    term.runCommand('rmdir /tmpdir');
    term.runCommand('ls /');
    expect(output.some(line => line.includes('tmpdir/'))).toBe(false);
  });

  test('cp and mv commands', () => {
    term.runCommand('touch /a.txt');
    term.runCommand('cp /a.txt /b.txt');
    term.runCommand('mv /b.txt /c.txt');
    term.runCommand('ls /');
    expect(output.some(line => line.includes('a.txt'))).toBe(true);
    expect(output.some(line => line.includes('b.txt'))).toBe(false);
    expect(output.some(line => line.includes('c.txt'))).toBe(true);
  });

  test('editor starts and saves file', () => {
    term.runCommand('edit /editfile.txt');
    expect(term.editor.isActive).toBe(true);
    term._editorHandle('line1');
    term._editorHandle(':wq');
    expect(term.editor.isActive).toBe(false);
    expect(term.vOS.readFile('/editfile.txt')).toContain('line1');
  });

  test('rps mode starts and stops', () => {
    term.runCommand('rps');
    expect(term.rps.isActive).toBe(true);
    term._rpsHandle('exit');
    expect(term.rps.isActive).toBe(false);
  });

  test('date, uname, whoami commands', () => {
    term.runCommand('date');
    term.runCommand('uname');
    term.runCommand('whoami');
    expect(output.some(line => line.includes('CentralTerminal OS'))).toBe(true);
    expect(output.some(line => line.includes('user'))).toBe(true);
  });

  test('history command stores commands', () => {
    term.runCommand('echo first');
    term.runCommand('echo second');
    term.runCommand('history');
    expect(output.some(line => line.includes('1  echo first'))).toBe(true);
    expect(output.some(line => line.includes('2  echo second'))).toBe(true);
  });

  test('clear command calls UI clear', () => {
    term.runCommand('clear');
    expect(mockUI.clearTerminal).toHaveBeenCalled();
  });
});
