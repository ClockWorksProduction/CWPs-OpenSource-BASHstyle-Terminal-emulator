module.exports = function cssTemplate() {
    return `body{margin:0;height:100vh;background-color:#000;color:#0f0;font-family:"Courier New",monospace;display:flex;justify-content:center;align-items:center;}
#pseudo-terminal{width:80%;max-width:1000px;height:80vh;background-color:#000;border:2px solid #0f0;box-shadow:0 0 20px rgba(0,255,0,0.5);display:flex;flex-direction:column;padding:1rem;overflow:hidden;position:relative;}
#terminalOutput{flex:1;overflow-y:scroll;white-space:pre-wrap;line-height:1.3;padding-right:0.2rem;scroll-behavior:smooth;}
#terminalOutput::-webkit-scrollbar{width:8px;}#terminalOutput::-webkit-scrollbar-track{background:#000;}#terminalOutput::-webkit-scrollbar-thumb{background-color:#0f0;border-radius:4px;}
#terminal-command{display:flex;align-items:center;margin-top:0.3rem;}#terminal-prompt{margin-right:0.5rem;}
#terminal-command-input{background:transparent;border:none;outline:none;color:#0f0;font-family:inherit;font-size:1rem;flex:1;caret-color:#0f0;}
#terminal-command-input::after{content:'|';animation:blink 1s step-start infinite;}
@keyframes blink{50%{opacity:0;}}
#pseudo-terminal::before{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background-image:repeating-linear-gradient(0deg,rgba(0,255,0,0.05),rgba(0,255,0,0.05) 1px,transparent 1px,transparent 2px);pointer-events:none;}
`;};
  