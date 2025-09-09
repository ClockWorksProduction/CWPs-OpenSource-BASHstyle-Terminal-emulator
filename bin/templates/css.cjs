module.exports = `
/*
========================================
  Screen Management (for Boot Sequence)
========================================
*/

/* Hides all screens by default */
.screen {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    color: #0f0;
    font-family: 'Courier New', Courier, monospace;
}

/* Shows the currently active screen */
.screen.active {
    display: flex;
    flex-direction: column;
}

/* Bootup screen styling */
#bootup-screen {
    padding: 2em;
    font-size: 1.2em;
    box-sizing: border-box;
    justify-content: flex-start;
    align-items: flex-start;
}

#bootup-text {
    white-space: pre-wrap;
    margin: 0;
}

#bootup-text > div {
    margin-bottom: 0.5em;
}

.status-ok { color: #2f2; }
.status-failed { color: #f22; font-weight: bold; }

/* Loading screen styling */
#loading-screen {
    justify-content: center;
    align-items: center;
}

#loading-text {
    font-size: 3em;
    letter-spacing: 0.2em;
    text-shadow: 0 0 5px #0f0;
}

.loading-bar-container {
    width: 60%;
    height: 20px;
    border: 2px solid #0f0;
    margin-top: 1em;
}

#loading-bar {
    width: 0%;
    height: 100%;
    background-color: #0f0;
    box-shadow: 0 0 10px #0f0;
    transition: width 0.1s ease-out;
}

/* Glitch overlay for transitions */
#glitch-overlay {
    z-index: 999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.1s linear;
}


/*
========================================
  Terminal Base & Layout (Your Original)
========================================
*/

/* Basic body styling */
body {
    margin: 0;
    background-color: #000;
    color: #0f0;
    font-family: 'Courier New', Courier, monospace;
    overflow: hidden;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.4);
}

/* Main terminal container */
#pseudo-terminal {
    /* REMOVED: \`display: none;\` This was the cause of the blank screen */
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    background-color: #000;
    overflow: hidden;
    filter: brightness(1.2) contrast(1.1);
}

/* Terminal output and input areas are stacked above the base */
#terminalOutput,
#terminal-command {
    position: relative;
    z-index: 10;
}

/* Output area styling */
#terminalOutput {
    flex: 1;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0 0 10px 0;
    padding-bottom: 10px;
    background: transparent;
    scroll-behavior: smooth;
}

/* Reduced line-height for compact output */
#terminalOutput > div {
    line-height: 1.1;
}

/* Input line container */
#terminal-command {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

/* Input prompt symbol */
#terminal-prompt {
    margin-right: 5px;
}

/* Command input field */
#terminal-command-input {
    flex-grow: 1;
    background-color: transparent;
    color: #00ff00;
    font-family: 'Courier New', Courier, monospace;
    border: none;
    outline: none;
    font-size: 1em;
    padding: 0;
    caret-color: #0f0;
}

/* Blinking caret animation for the input */
#terminal-command-input:focus {
    animation: blink-caret 1s steps(1) infinite;
}

@keyframes blink-caret {
    50% { caret-color: transparent; }
}


/*
========================================
  CRT Visual Effects (Your Original + Fixes)
========================================
*/

/* Vignette, scanlines, and curvature effect */
.crt-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 20;
    pointer-events: none;
}

.crt-overlay::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0.2) 0,
        rgba(0,0,0,0.2) 1px,
        transparent 1px,
        transparent 2px
    );
    box-shadow:
        inset 0 0 15vmin 5vmin rgba(0,0,0,0.5),
        inset 0 0 10vmin 5vmin rgba(255,255,255,0.05);
    opacity: 0.8;
    animation: scanline-move 0.2s linear infinite;
}

@keyframes scanline-move {
    from { background-position-y: 0; }
    to { background-position-y: -2px; }
}


.crt-overlay::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0) 65%,
      rgba(0, 0, 0, 0.4) 100%
    );
    opacity: 0.5;
}

/* Static-like noise effect */
.crt-noise {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 25;
    pointer-events: none;
    opacity: 0.02;
    mix-blend-mode: screen;
}

/* Horizontal green scanlines (can be removed if ::before is preferred) */
.crt-scanlines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 30;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 255, 0, 0.1) 0px,
      rgba(0, 255, 0, 0.1) 2px,
      transparent 2px,
      transparent 4px
    );
    mix-blend-mode: screen;
}

/* Moving vertical sweep bar */
.crt-sweep {
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 200%;
    background: linear-gradient(
      to bottom,
      rgba(0,255,0,0) 0%,
      rgba(0,255,0,0.15) 50%,
      rgba(0,255,0,0) 100%
    );
    animation: sweep 6s linear infinite;
    z-index: 35;
    pointer-events: none;
}

@keyframes sweep {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}

/* Subtle flicker effect on the overlay */
.crt-overlay.flicker {
    animation: flicker 0.2s linear infinite alternate;
}

@keyframes flicker {
    0%   { opacity: 0.85; }
    50%  { opacity: 0.8; }
    100% { opacity: 0.9; }
}

/* Subtle jitter effect on the whole terminal */
#pseudo-terminal.jitter {
    animation: jitter 0.1s infinite alternate;
}

@keyframes jitter {
    0%   { transform: translate(0.5px, 0.5px); }
    25%  { transform: translate(-0.5px, 0.5px); }
    50%  { transform: translate(0.5px, -0.5px); }
    75%  { transform: translate(-0.5px, -0.5px); }
    100% { transform: translate(0, 0); }
}
`;