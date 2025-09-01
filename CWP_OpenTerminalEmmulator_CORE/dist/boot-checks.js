export class BootCheck {
    constructor(name, check, description) {
        this.name = name;
        this.check = check;
        this.description = description;
    }
}

export class BootCheckRegistry {
    constructor() {
        this.checks = [];
    }

    addCheck(check) {
        this.checks.push(check);
    }

    async runChecks(terminal) {
        let allOk = true;
        for (const item of this.checks) {
            terminal.biosOutput.innerHTML += `<p> ${item.name}... </p>`;
            const result = await terminal.bootCheck(item.check);
            terminal.biosOutput.lastChild.innerHTML += `<span class="status-${result.status}">${result.message}</span>`;
            if (result.status === 'failed') allOk = false;
        }
        return allOk;
    }
}
