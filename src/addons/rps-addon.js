import { Addon } from '../index.js';

class RpsAddon extends Addon {
    constructor() {
        super('rps');
        this.player = 0;
        this.cpu = 0;
        this.rounds = 0;

        // Register addon-specific commands
        this.addCommand('rock', 'Choose rock', () => this.play('rock'));
        this.addCommand('paper', 'Choose paper', () => this.play('paper'));
        this.addCommand('scissors', 'Choose scissors', () => this.play('scissors'));
        this.addCommand('score', 'View the current score', () => this.showScore());
    }

    onStart() {
        this.term.clear();
        this.term._print('--- Rock, Paper, Scissors ---');
        this.commands.help.execute(); // Show rps-specific help
        this.player = 0; this.cpu = 0; this.rounds = 0;
    }

    play(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const cpuChoice = choices[Math.floor(Math.random() * 3)];
        this.term._print(`> You: ${playerChoice} | Computer: ${cpuChoice}`);

        if (playerChoice === cpuChoice) {
            this.term._print("It's a tie!");
        } else if ((playerChoice === 'rock' && cpuChoice === 'scissors') || (playerChoice === 'paper' && cpuChoice === 'rock') || (playerChoice === 'scissors' && cpuChoice === 'paper')) {
            this.term._print('You win!'); this.player++;
        } else {
            this.term._print('Computer wins.'); this.cpu++;
        }
        this.rounds++;
        this.term._print('---');
    }

    showScore() {
        this.term._print(`-- Score: Player ${this.player} - ${this.cpu} CPU (${this.rounds} rounds) --`);
    }
    
    onStop() {
        this.term.clear();
        this.term._print('Thanks for playing!');
        this.showScore();
    }
}

export { RpsAddon };
