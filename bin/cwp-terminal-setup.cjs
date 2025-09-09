const fs = require('fs');
const path = require('path');

const jsTemplate = require('./templates/js.cjs');
const cssTemplate = require('./templates/css.cjs');
const htmlTemplate = require('./templates/html.cjs');

function createProject(projectName) {
  if (!projectName) {
    console.error('Error: Project name is required.');
    console.log('Usage: create-cwp-terminal-project <project-name>');
    return;
  }

  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(`Error: Directory '${projectName}' already exists.`);
    return;
  }

  fs.mkdirSync(projectPath, { recursive: true });

  const uiOptions = {
    outputSelector: '#terminalOutput',
    promptSelector: '#terminal-prompt',
    inputSelector: '#terminal-command-input'
  };

  fs.writeFileSync(path.join(projectPath, 'app.js'), jsTemplate(uiOptions));
  fs.writeFileSync(path.join(projectPath, 'style.css'), cssTemplate());
  fs.writeFileSync(path.join(projectPath, 'index.html'), htmlTemplate());

  fs.writeFileSync(path.join(projectPath, 'TODO.md'), '# Todo List\n\n- [ ] Finish setting up the terminal.\n- [ ] Create custom addons.\n- [ ] Deploy the project.\n');

  console.log(`Successfully created project '${projectName}'`);
  console.log(`To get started, run:\n  cd ${projectName}\n  # Open index.html in your browser`);
}

module.exports = { createProject };
