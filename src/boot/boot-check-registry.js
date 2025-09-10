class BootCheckRegistry {
    constructor() { this.checks = []; }
    add(check) { this.checks.push(check); }
    async run(bootupElement) {
      let allOk = true;
      for (const check of this.checks) {
        let lineElement;
        // Only perform DOM operations if the bootupElement exists
        if (bootupElement) {
          lineElement = document.createElement('div');
          lineElement.innerHTML = `- ${check.name}... `;
          bootupElement.appendChild(lineElement);
        }
  
        let statusText = '';
        try {
          // Always run the check function
          const passed = await check.fn();
          if (!passed) allOk = false;
          statusText = passed ? '<span class="status-ok">OK</span>' : '<span class="status-failed">FAILED</span>';
        } catch (e) {
          console.error(`Boot check "${check.name}" failed with an error:`, e);
          statusText = '<span class="status-failed">FAILED</span>';
          allOk = false;
        }
  
        // Only update the DOM if it exists
        if (bootupElement && lineElement) {
          lineElement.innerHTML += statusText;
        }
      }
      return allOk;
    }
}

export { BootCheckRegistry };
