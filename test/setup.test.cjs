const fs = require('fs');
const readline = require('readline');
const { main } = require('../bin/cwp-terminal-setup.cjs');

// Mock FS and Readline
jest.mock('fs');
jest.mock('readline');

describe('CWP Terminal Setup CLI', () => {
  let rlInterfaceMock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock readline interface
    rlInterfaceMock = {
      question: jest.fn(),
      close: jest.fn(),
    };
    readline.createInterface.mockReturnValue(rlInterfaceMock);

    // Mock fs functions
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.endsWith('index.html')) return '<html><body></body></html>';
      return '';
    });
    fs.existsSync.mockImplementation((filePath) => false); // ensure mkdirSync runs
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should generate full project with --new', async () => {
    await main(['--new', '--dir', 'test-dir']);

    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('test-dir/index.html'),
      expect.any(String),
      'utf8'
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('test-dir/style.css'),
      expect.any(String),
      'utf8'
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('test-dir/app.js'),
      expect.any(String),
      'utf8'
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('test-dir/TODO.md'),
      expect.any(String),
      'utf8'
    );
  });

  test('should generate manual JS with --manual', async () => {
    await main(['--manual', '--dir', 'manual-dir']);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('manual-dir/app.js'),
      expect.any(String),
      'utf8'
    );
  });

  test('should refactor JS and inject div', async () => {
    rlInterfaceMock.question.mockImplementation((q, cb) => cb('test'));

    fs.existsSync.mockImplementation(() => true); // directory exists
    fs.readFileSync.mockImplementation((filePath) =>
      filePath.endsWith('index.html') ? '<html><body></body></html>' : ''
    );

    await main(['--refactor', '--dir', 'test']);

    // Ensure index.html read and written
    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringMatching(/index\.html$/),
      'utf8'
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringMatching(/index\.html$/),
      expect.stringContaining('<div id="pseudo-terminal">'),
      'utf8'
    );

    // Ensure JS overwritten
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringMatching(/app\.js$/),
      expect.any(String),
      'utf8'
    );
  });

  test('should call process.exit when multiple flags provided', async () => {
    // Make process.exit throw to avoid hanging test
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    await expect(main(['--new', '--manual'])).rejects.toThrow('process.exit called');
  }, 10000); // extend timeout just in case
});
