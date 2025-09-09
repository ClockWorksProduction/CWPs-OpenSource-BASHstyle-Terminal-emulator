module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CWP Open Terminal Emulator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="pseudo-terminal" class="crt-container">
    <div id="terminalOutput"></div>
    <div id="terminal-command">
      <span id="terminal-prompt"></span>
      <input id="terminal-command-input" type="text" />
    </div>

    <!-- CRT layers -->
    <div class="crt-overlay"></div>
    <div class="crt-green-scanlines"></div>
    <div class="crt-sweep"></div>
  </div>

  <script type="module" src="app.js"></script>
</body>
</html>
`;