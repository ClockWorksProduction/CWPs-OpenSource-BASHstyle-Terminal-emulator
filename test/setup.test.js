
// test/setup.test.js

// Mock 'fs' and 'readline' modules for testing the CLI script in isolation.
jest.mock('fs');
jest.mock('readline', () => ({
  createInterface: jest.fn().mockReturnValue({
    question: jest.fn().mockImplementation((query, callback) => {
      // Default to 'scaffold' if not otherwise specified by a test
      callback('scaffold');
    }),
    close: jest.fn(),
  }),
}));

const fs = require('fs');
const readline = require('readline');
// Import the main function after mocks are set up
const { main } = require('../bin/cwp-terminal-setup.cjs');

describe('CWP Terminal Setup Script', () => {

  // Before each test, clear the history of mock function calls to ensure isolation.
  beforeEach(() => {
    fs.writeFileSync.mockClear();
    fs.mkdirSync.mockClear();
    fs.readFileSync.mockClear();
    fs.existsSync.mockClear();
    const rl = readline.createInterface();
    rl.question.mockClear();
    rl.close.mockClear();
  });

  test('scaffold mode should generate a full project', async () => {
    // Simulate user choosing 'scaffold' (which is the default mock behavior)
    await main();

    // Verify the project directory is created
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('terminal-demo'),
      { recursive: true }
    );

    // Verify that all four project files are written
    expect(fs.writeFileSync).toHaveBeenCalledTimes(4);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('index.html'),
      expect.stringContaining('CWP Open Terminal Emulator')
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('style.css'),
      expect.stringContaining('#terminal')
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('app.js'),
      expect.stringContaining("new CentralTerminal('#terminal')")
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('todo.md'),
      expect.stringContaining('# TODO')
    );
  });

  test('refactor mode should patch existing files and create missing ones', async () => {
    // --- Test Setup ---
    // 1. Simulate user input for 'refactor' mode
    const questionMock = readline.createInterface().question;
    questionMock.mockImplementationOnce((q, cb) => cb('refactor')); // Mode
    questionMock.mockImplementationOnce((q, cb) => cb('index.html')); // HTML path
    questionMock.mockImplementationOnce((q, cb) => cb('app.js'));     // JS path
    questionMock.mockImplementationOnce((q, cb) => cb('style.css'));  // CSS path

    // 2. Simulate reading an HTML file that needs patching
    const fakeHtml = '<html><body></body></html>';
    fs.readFileSync.mockReturnValue(fakeHtml);

    // 3. Simulate the CSS file not existing, so it needs to be created
    fs.existsSync.mockReturnValue(false);
    
    // --- Run Script ---
    await main();

    // --- Assertions ---
    // Verify it read the HTML file
    expect(fs.readFileSync).toHaveBeenCalledWith('index.html', 'utf8');

    // Verify it wrote the CSS file (since existsSync was false)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'style.css',
      expect.stringContaining('body')
    );
    
    // Verify it patched the HTML and overwrote the JS
    // Total writes: 1 for patched HTML, 1 for new CSS, 1 for new JS
    expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
    
    // Check HTML patch content
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'index.html',
      expect.stringContaining('<div id="central-terminal-container"></div>')
    );
    
    // Check JS overwrite content
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'app.js',
      expect.stringContaining("new CentralTerminal('#central-terminal-container')")
    );
  });

  test('manual mode should generate a custom app.js with all options', async () => {
    // Simulate a user choosing 'manual' and providing all custom selectors
    const questionMock = readline.createInterface().question;
    questionMock.mockImplementationOnce((q, cb) => cb('manual'));     // Mode
    questionMock.mockImplementationOnce((q, cb) => cb('#my-term'));   // Container
    questionMock.mockImplementationOnce((q, cb) => cb('.my-input'));  // Input
    questionMock.mockImplementationOnce((q, cb) => cb('.my-output')); // Output
    questionMock.mockImplementationOnce((q, cb) => cb('.my-prompt')); // Prompt

    await main(); // Run the script

    // Verify only one file (app.js) was written
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

    // Get the content passed to writeFileSync
    const writeCallArgs = fs.writeFileSync.mock.calls[0];
    const filePath = writeCallArgs[0];
    const fileContent = writeCallArgs[1];

    // Check that it's writing to app.js
    expect(filePath).toContain('app.js');
    
    // Check for all custom selectors in the generated content
    expect(fileContent).toContain("new CentralTerminal('#my-term'");
    expect(fileContent).toContain("inputSelector: '.my-input'");
    expect(fileContent).toContain("outputSelector: '.my-output'");
    expect(fileContent).toContain("promptSelector: '.my-prompt'");
  });
});
