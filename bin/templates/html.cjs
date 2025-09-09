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

    <div id="bootup-screen" class="screen active">
        <pre id="bootup-text"></pre>
        <div class="cursor"></div>
    </div>

    <div id="loading-screen" class="screen">
        <h1 id="loading-text">LOADING...</h1>
        <div class="loading-bar-container">
            <div id="loading-bar"></div>
        </div>
    </div>

    <div id="glitch-overlay"></div>

    <div id="pseudo-terminal" class="screen crt-container">
        <div id="terminalOutput"></div>
        <div id="terminal-command">
            <span id="terminal-prompt"></span>
            <input id="terminal-command-input" type="text" />
        </div>
        <div class="crt-overlay"></div>
        <div class="crt-green-scanlines"></div>
        <div class="crt-sweep"></div>
    </div>

    <script type="module" src="app.js"></script>
</body>
</html>
`;