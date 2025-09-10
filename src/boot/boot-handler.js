class BootHandler {
    constructor(terminal) {
        this.term = terminal;
        this.bootupTextElement = document.getElementById('bootup-text');
        this.loadingBar = document.getElementById('loading-bar');
        this.screens = document.querySelectorAll('.screen');
        this.glitchOverlay = document.getElementById('glitch-overlay');
        this.typingSpeed = 10;
        this.glitchDuration = 300;
        this.bootupText = terminal.customBootupText || `
        CWP Open Terminal BIOS v5.x.x
        -----------------------------------
        Initializing system...
        `;      
    }
  
    run() {
        return new Promise(resolve => {
            this.startBootupAnimation().then(() => resolve());
        });
    }
  
    showScreen(screenId) {
        this.screens.forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) {
            screenToShow.classList.add('active');
        }
    }
  
    async startBootupAnimation() {
        this.showScreen('bootup-screen');
        if (!this.bootupTextElement) {
            return this.runBootChecks();
        }
  
        await this.typeText(this.bootupText);
        const bootSuccess = await this.runBootChecks();
  
        if (bootSuccess) {
            await this.typeText('\nSystem ready. Initializing user session...\n');
            await this.startLoadingScreen();
        } else {
            await this.typeText('\n<span class="status-failed">A critical error occurred. System halted.</span>');
            return Promise.reject("Boot failed");
        }
    }
  
    typeText(text) {
        return new Promise(resolve => {
            if (!this.bootupTextElement) return resolve();
            let i = 0;
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    this.bootupTextElement.innerHTML += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typingInterval);
                    setTimeout(resolve, 200); // Small pause after typing
                }
            }, this.typingSpeed);
        });
    }
  
    runBootChecks() {
      // The registry now receives the DOM element directly
      // to manage the line-by-line display of checks.
      return this.term.bootRegistry.run(this.bootupTextElement);
    }
    
    startLoadingScreen() {
        return new Promise(resolve => {
            this.showScreen('loading-screen');
            if (!this.loadingBar) return resolve();
            
            let width = 0;
            const loadingInterval = setInterval(() => {
                width += Math.random() * 4;
                if (width >= 100) {
                    width = 100;
                    this.loadingBar.style.width = width + '%';
                    clearInterval(loadingInterval);
                    // FIXED: Added a 500ms pause here to ensure the full bar is visible
                    setTimeout(() => {
                        this.triggerGlitchTransition(resolve);
                    }, 500);
                } else {
                    this.loadingBar.style.width = width + '%';
                }
            }, 50);
        });
    }
  
    triggerGlitchTransition(callback) {
        if (!this.glitchOverlay) return callback();
        
        this.glitchOverlay.style.opacity = '1';
        setTimeout(() => {
            this.showScreen('pseudo-terminal');
            callback();
            this.glitchOverlay.style.opacity = '0';
        }, this.glitchDuration);
    }
}

export { BootHandler };
