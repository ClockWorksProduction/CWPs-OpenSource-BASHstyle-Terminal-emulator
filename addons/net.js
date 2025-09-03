import { Addon } from '/src/index.js';

class NetAddon extends Addon {
    constructor() {
        super('net');
    }

    onStart(term, vOS, ...args) {
        super.onStart(term, vOS, ...args);
        const [command, ...rest] = args;

        switch (command) {
            case 'ping':
                this.ping(rest[0]);
                break;
            case 'curl':
                this.curl(rest[0]);
                break;
            default:
                this.term.print('Usage: net [ping|curl] <url>');
                this.exit();
        }
    }

    async ping(host) {
        if (!host) {
            this.term.print('Usage: net ping <host>');
            this.exit();
            return;
        }

        this.term.print(`Pinging ${host}...`);
        const startTime = Date.now();

        try {
            // We use fetch with 'no-cors' to simulate a ping. We can't get a real ICMP response.
            await fetch(`https://${host}`, { mode: 'no-cors' });
            const duration = Date.now() - startTime;
            this.term.print(`Pong from ${host} in ${duration}ms`);
        } catch (error) {
            this.term.print(`Ping failed: ${error.message}`);
        }
        this.exit();
    }

    async curl(url) {
        if (!url) {
            this.term.print('Usage: net curl <url>');
            this.exit();
            return;
        }

        this.term.print(`Fetching content from ${url}...\n`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            this.term.print(text);
        } catch (error) {
            this.term.print(`Failed to fetch: ${error.message}`);
        }
        this.exit();
    }
}

export function register(addonExecutor) {
    addonExecutor.registerAddon(new NetAddon());
}
