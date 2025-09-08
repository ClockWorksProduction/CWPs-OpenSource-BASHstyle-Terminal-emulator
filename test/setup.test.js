/** @jest-environment node */

import { jest } from '@jest/globals';
import path from 'path';

// Mock the modules before any other imports
jest.unstable_mockModule('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn((_, cb) => cb('')),
    close: jest.fn(),
    on: jest.fn(),
  })),
}));

jest.unstable_mockModule('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

// Now, import the mocked modules and the script under test
import readline from 'readline';
import fs from 'fs';
import { main } from '../bin/cwp-terminal-setup.cjs';

describe('CWP Terminal Setup Script (v5.2.4)', () => {
  let questionMock;
  let originalArgv;

  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
    originalArgv = process.argv;
    // Get a reference to the mocked question function
    questionMock = readline.createInterface().question;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('Flag-based execution', () => {
    it('should generate a new project with --new', async () => {
      process.argv = ['node', 'script.js', '--new'];
      await main();
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('terminal-demo'), { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledTimes(4);
    });

    it('should use --dir for output directory with --new', async () => {
      process.argv = ['node', 'script.js', '--new', '--dir', 'custom-output'];
      await main();
      const expectedDir = path.resolve(process.cwd(), 'custom-output');
      expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDir, { recursive: true });
    });

    it('should update JS file with --refactor', async () => {
      process.argv = ['node', 'script.js', '--refactor'];
      questionMock.mockImplementationOnce((q, cb) => cb('my-app.js'));
      fs.existsSync.mockReturnValue(false);
      await main();
      expect(fs.writeFileSync).toHaveBeenCalledWith('my-app.js', expect.any(String));
    });

    it('should intelligently inject missing elements with --manual', async () => {
      process.argv = ['node', 'script.js', '--manual', '--dir', '.'];
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('<html><body><div id="pseudo-terminal"></div></body></html>');
      questionMock.mockImplementation((q, cb) => cb(''));
      await main();
      const htmlCall = fs.writeFileSync.mock.calls.find(c => c[0].endsWith('index.html'));
      expect(htmlCall).toBeDefined();
      const writtenHtml = htmlCall[1];
      expect(writtenHtml).toContain('<div id="terminalOutput"></div>');
    });
  });

  describe('Interactive fallback execution', () => {
    it('should run "new" project setup', async () => {
      process.argv = ['node', 'script.js'];
      questionMock
        .mockImplementationOnce((q, cb) => cb('new'))
        .mockImplementationOnce((q, cb) => cb('interactive-demo'));
      await main();
      const expectedDir = path.resolve(process.cwd(), 'interactive-demo');
      expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDir, { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledTimes(4);
    });

    it('should inform user that interactive refactor is not supported', async () => {
        process.argv = ['node', 'script.js'];
        questionMock.mockImplementationOnce((q, cb) => cb('refactor'));
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        await main();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Interactive refactor not supported"));
        consoleSpy.mockRestore();
    });
  });
});
