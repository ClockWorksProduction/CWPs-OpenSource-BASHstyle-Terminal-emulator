import { Addon } from '/src/index.js';

class RockPaperScissorsAddon extends Addon {
    constructor() {
        super('rps');
        this.playerScore = 0;
        this.computerScore = 0;
    }

    onStart(term) {
        super.onStart(term);
        this.term.print('Rock, Paper, Scissors addon started. Type \'play rock\', \'play paper\', or \'play scissors\' to play. Type \'help\' for more commands.');
    }

    onCommand(input) {
        const [command, ...args] = input.split(' ');
        switch (command) {
            case 'play':
                this.play(args[0]);
                break;
            case 'score':
                this.printScore();
                break;
            case 'help':
                this.printHelp();
                break;
            default:
                this.term.print(`Unknown command: ${command}. Type 'help' for a list of commands.`);
                break;
        }
    }

    play(playerChoice) {
        if (!['rock', 'paper', 'scissors'].includes(playerChoice)) {
            this.term.print('Invalid choice. Please choose rock, paper, or scissors.');
            return;
        }

        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];

        this.term.print(`You chose ${playerChoice}, computer chose ${computerChoice}.`);

        if (playerChoice === computerChoice) {
            this.term.print('It\'s a tie!');
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            this.term.print('You win!');
            this.playerScore++;
        } else {
            this.term.print('You lose.');
            this.computerScore++;
        }
    }

    printScore() {
        this.term.print(`Player: ${this.playerScore}, Computer: ${this.computerScore}`);
    }

    printHelp() {
        this.term.print('Available commands:\n');
        this.term.print('  play [rock|paper|scissors] - Play a round of Rock, Paper, Scissors.\n');
        this.term.print('  score - Show the current score.\n');
        this.term.print('  help - Show this help message.\n');
        this.term.print("  exit - Exit the addon and return to the main terminal.\n");
    }
}

export function register(addonExecutor) {
    addonExecutor.registerAddon(new RockPaperScissorsAddon());
}
