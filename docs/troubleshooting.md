# Troubleshooting and FAQ

This page provides solutions to common problems and answers to frequently asked questions.

## Addon not starting

**Problem:** I run `run myaddon` but my addon doesn't start.

**Solution:** Make sure you have correctly registered your addon using `term.registerAddon(new MyAddon());` before calling `term.boot();`.

## "Unknown command" error

**Problem:** I'm getting an "Unknown command" error when I type a command in my addon.

**Solution:** Check the `onCommand` method in your addon. Make sure you are correctly handling the user's input and that the command you are typing is one of the recognized commands.

## How to exit an addon

**Question:** How do I exit an addon and return to the main terminal?

**Answer:** Use the `exit` command.

## Passing arguments to an addon

**Question:** Can I pass arguments to an addon when I start it?

**Answer:** Yes, you can pass arguments to the `run` command. These arguments will be passed to the `onStart` method of your addon.

```bash
run myaddon arg1 arg2
```

```javascript
class MyAddon extends Addon {
    onStart(term, vOS, ...args) {
        this.term.print(`Arguments: ${args.join(', ')}`);
    }
}
```
