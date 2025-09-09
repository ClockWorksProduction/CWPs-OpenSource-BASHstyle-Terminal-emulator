const fs = require('fs');
const path = require('path');
const { createProject } = require('../bin/cwp-terminal-setup.cjs');

// Mock the templates being used
jest.mock('../bin/templates/js.cjs', () => jest.fn(() => 'mock_js_content'));
jest.mock('../bin/templates/css.cjs', () => 'mock_css_content', { virtual: true });
jest.mock('../bin/templates/html.cjs', () => 'mock_html_content', { virtual: true });

// Mock the entire fs module
jest.mock('fs');

describe('createProject', () => {
  beforeEach(() => {
    // Clear all mocks before each test to ensure a clean slate
    jest.clearAllMocks();
    // Spy on console.error and mock its implementation to prevent logging during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original implementations after each test
    jest.restoreAllMocks();
  });

  test('should create all project files and directories correctly', () => {
    // Arrange: Mock that the project directory does not exist to allow creation
    fs.existsSync.mockReturnValue(false);
    const projectName = 'my-new-terminal';
    const projectPath = path.join(process.cwd(), projectName);

    // Act: Run the function to be tested
    createProject(projectName);

    // Assert: Verify that the expected filesystem operations were performed
    expect(fs.mkdirSync).toHaveBeenCalledWith(projectPath, { recursive: true });

    const jsTemplate = require('../bin/templates/js.cjs');
    expect(jsTemplate).toHaveBeenCalledWith({
      outputSelector: '#terminalOutput',
      promptSelector: '#terminal-prompt',
      inputSelector: '#terminal-command-input'
    });

    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(projectPath, 'app.js'), 'mock_js_content');
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(projectPath, 'style.css'), 'mock_css_content');
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(projectPath, 'index.html'), 'mock_html_content');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(projectPath, 'TODO.md'),
        expect.stringContaining('# Todo List')
    );
    expect(fs.writeFileSync).toHaveBeenCalledTimes(4);
  });

  test('should log an error if the project directory already exists', () => {
    // Arrange: Mock that the directory already exists
    fs.existsSync.mockReturnValue(true);
    const projectName = 'existing-project';

    // Act: Run the function
    createProject(projectName);

    // Assert: Check that an error was logged and no files were written
    expect(console.error).toHaveBeenCalledWith(`Error: Directory '${projectName}' already exists.`);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test('should log an error if no project name is provided', () => {
    // Act: Call the function without a project name
    createProject(undefined);

    // Assert: Check that an error was logged and no action was taken
    expect(console.error).toHaveBeenCalledWith('Error: Project name is required.');
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
