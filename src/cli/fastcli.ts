#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Fast CLI Parser - Zero dependency command-line argument parser (TypeScript)
 * Replaces Commander.js with a lightweight, performant alternative
 */

// Type definitions
interface ParsedFlag {
    short: string | null;
    long: string;
    hasValue: boolean;
}

interface OptionConfig {
    short: string | null;
    long: string;
    description: string;
    hasValue: boolean;
    defaultValue?: any;
}

interface ParsedArgs {
    command: string | null;
    options: Record<string, any>;
    commandOptions: Record<string, any>;
    args: string[];
}

interface ParsedOption {
    key: string;
    value: any;
    nextIndex: number;
}

type PreActionHook = () => Promise<void> | void;
type CommandAction = (options: Record<string, any>, args: string[]) => Promise<void> | void;

/**
 * Fast CLI Parser - Zero dependency command-line argument parser
 */
export class FastCLI {
    private commands: Map<string, Command> = new Map();
    private globalOptions: Map<string, OptionConfig> = new Map();
    private description: string = '';
    private version: string = '';
    private preActionHooks: PreActionHook[] = [];
    private helpFlag: boolean = false;
    private versionFlag: boolean = false;
    private _lastParsed: ParsedArgs | null = null;

    /**
     * Set CLI description
     */
    setDescription(desc: string): this {
        this.description = desc;
        return this;
    }

    /**
     * Set CLI version
     */
    setVersion(ver: string): this {
        this.version = ver;
        return this;
    }

    /**
     * Add global option
     */
    option(flag: string, description: string, defaultValue?: any): this {
        const { short, long, hasValue } = this.parseFlag(flag);
        this.globalOptions.set(long, {
            short,
            long,
            description,
            hasValue,
            defaultValue
        });
        return this;
    }

    /**
     * Add command
     */
    command(name: string): Command {
        const cmd = new Command(name, this);
        this.commands.set(name, cmd);
        return cmd;
    }

    /**
     * Add pre-action hook
     */
    hook(type: 'preAction', fn: PreActionHook): this {
        if (type === 'preAction') {
            this.preActionHooks.push(fn);
        }
        return this;
    }

    /**
     * Parse flag string into components
     */
    parseFlag(flag: string): ParsedFlag {
        const parts = flag.split(',').map(p => p.trim());
        let short: string | null = null;
        let long: string = '';
        let hasValue: boolean = false;

        for (const part of parts) {
            if (part.startsWith('--')) {
                const match = part.match(/^--([a-zA-Z0-9-]+)(?:\s+<(.+)>)?/);
                if (match) {
                    long = match[1];
                    hasValue = !!match[2];
                }
            } else if (part.startsWith('-')) {
                const match = part.match(/^-([a-zA-Z])(?:\s+<(.+)>)?/);
                if (match) {
                    short = match[1];
                    hasValue = hasValue || !!match[2];
                }
            }
        }

        return { short, long, hasValue };
    }

    /**
     * Parse command line arguments
     */
    parseArgs(argv: string[] = process.argv.slice(2)): ParsedArgs {
        const result: ParsedArgs = {
            command: null,
            options: {},
            commandOptions: {},
            args: []
        };

        // Set default values for global options
        for (const [key, option] of this.globalOptions) {
            if (option.defaultValue !== undefined) {
                result.options[key] = option.defaultValue;
            }
        }

        let i = 0;
        let commandFound = false;
        let currentCommand: Command | null = null;

        if (!argv.length) {
            this.helpFlag = true;
            return result;
        }

        while (i < argv.length) {
            const arg = argv[i];

            // Check for help
            if (arg === '--help' || arg === '-h') {
                this.helpFlag = true;
                return result;
            }

            // Check for version
            if (arg === '--version' || arg === '-V') {
                this.versionFlag = true;
                return result;
            }

            // Handle options
            if (arg.startsWith('-') && !commandFound) {
                const parsed = this.parseOption(arg, argv, i, this.globalOptions);
                if (parsed) {
                    result.options[parsed.key] = parsed.value;
                    i = parsed.nextIndex;
                    continue;
                }
            }

            // Handle command options
            if (arg.startsWith('-') && commandFound && currentCommand) {
                const parsed = this.parseOption(arg, argv, i, currentCommand.getOptions());
                if (parsed) {
                    result.commandOptions[parsed.key] = parsed.value;
                    i = parsed.nextIndex;
                    continue;
                }
            }

            // Check for command
            if (!commandFound && this.commands.has(arg)) {
                result.command = arg;
                currentCommand = this.commands.get(arg)!;
                commandFound = true;
                
                // Set default values for command options
                for (const [key, option] of currentCommand.getOptions()) {
                    if (option.defaultValue !== undefined) {
                        result.commandOptions[key] = option.defaultValue;
                    }
                }
            } else if (commandFound) {
                // Collect remaining args
                result.args.push(arg);
            }

            i++;
        }

        this._lastParsed = result;
        return result;
    }

    /**
     * Parse individual option
     */
    private parseOption(
        arg: string, 
        argv: string[], 
        index: number, 
        optionsMap: Map<string, OptionConfig>
    ): ParsedOption | null {
        let key: string | null = null;
        let value: string = '';
        let nextIndex = index + 1;

        if (arg.startsWith('--')) {
            // Long option
            const longName = arg.slice(2);
            const option = optionsMap.get(longName);
            if (option) {
                key = longName;
                if (option.hasValue && index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
                    value = argv[index + 1];
                    nextIndex = index + 2;
                }
            }
        } else if (arg.startsWith('-')) {
            // Short option(s)
            const shortFlags = arg.slice(1);
            for (const [longName, option] of optionsMap) {
                if (option.short === shortFlags) {
                    key = longName;
                    if (option.hasValue && index + 1 < argv.length && !argv[index + 1].startsWith('-')) {
                        value = argv[index + 1];
                        nextIndex = index + 2;
                    }
                    break;
                }
            }
        }

        return key ? { key, value, nextIndex } : null;
    }

    /**
     * Generate help text
     */
    generateHelp(commandName?: string): string {
        let help = '';

        if (commandName && this.commands.has(commandName)) {
            const cmd = this.commands.get(commandName)!;
            help += `Usage: ${process.argv[1]} ${commandName} [options]\n\n`;
            help += `${cmd.getDescription()}\n\n`;

            const cmdOptions = cmd.getOptions();
            if (cmdOptions.size > 0) {
                help += 'Options:\n';
                for (const [key, option] of cmdOptions) {
                    const flags = option.short ? `-${option.short}, --${key}` : `--${key}`;
                    help += `  ${flags.padEnd(20)} ${option.description}\n`;
                }
            }
        } else {
            help += `Usage: ${process.argv[1]} [options] [command]\n\n`;
            help += `${this.description}\n\n`;

            if (this.globalOptions.size > 0) {
                help += 'Options:\n';
                for (const [key, option] of this.globalOptions) {
                    const flags = option.short ? `-${option.short}, --${key}` : `--${key}`;
                    help += `  ${flags.padEnd(20)} ${option.description}\n`;
                }
                help += '\n';
            }

            if (this.commands.size > 0) {
                help += 'Commands:\n';
                for (const [name, cmd] of this.commands) {
                    help += `  ${name.padEnd(20)} ${cmd.getDescription()}\n`;
                }
            }
        }

        return help;
    }

    /**
     * Parse and execute
     */
    async parse(argv: string[] = process.argv.slice(2)): Promise<void> {
        const parsed = this.parseArgs(argv);

        // Handle help
        if (this.helpFlag) {
            console.log(this.generateHelp(parsed.command || undefined));
            return;
        }

        // Handle version
        if (this.versionFlag) {
            console.log(this.version);
            return;
        }

        // Run pre-action hooks
        for (const hook of this.preActionHooks) {
            await hook();
        }

        // Execute command
        if (parsed.command && this.commands.has(parsed.command)) {
            const command = this.commands.get(parsed.command)!;
            await command.execute(parsed.commandOptions, parsed.args);
        } else if (parsed.command) {
            console.error(`Unknown command: ${parsed.command}`);
            process.exit(1);
        }
    }

    /**
     * Get parsed options (for compatibility)
     */
    opts(): Record<string, any> {
        return this._lastParsed?.options || {};
    }
}

/**
 * Command class
 */
export class Command {
    private name: string;
    private cli: FastCLI;
    private description: string = '';
    private options: Map<string, OptionConfig> = new Map();
    private action: CommandAction | null = null;

    constructor(name: string, cli: FastCLI) {
        this.name = name;
        this.cli = cli;
    }

    /**
     * Set command description
     */
    setDescription(desc: string): this {
        this.description = desc;
        return this;
    }

    /**
     * Add command option
     */
    option(flag: string, description: string, defaultValue?: any): this {
        const { short, long, hasValue } = this.cli.parseFlag(flag);
        this.options.set(long, {
            short,
            long,
            description,
            hasValue,
            defaultValue
        });
        return this;
    }

    /**
     * Set command action
     */
    setAction(fn: CommandAction): this {
        this.action = fn;
        return this;
    }

    /**
     * Execute command
     */
    async execute(options: Record<string, any>, args: string[]): Promise<void> {
        if (this.action) {
            // console.log(options, args)
            await this.action(options, args);
        }
    }

    /**
     * Get command description
     */
    getDescription(): string {
        return this.description;
    }

    /**
     * Get command options
     */
    getOptions(): Map<string, OptionConfig> {
        return this.options;
    }

    /**
     * Get command name
     */
    getName(): string {
        return this.name;
    }
}

// Usage example and migration from Commander.js:
/*
import { FastCLI } from './fastcli.js';

const cli = new FastCLI();

cli.setVersion('1.0.0')
   .setDescription('A secure and efficient command-line tool for managing private keys.')
   .option('-v, --verbose', 'Enable verbose logging for detailed output');

cli.hook('preAction', async () => {
    if (cli.opts().verbose) {
        process.env.LOG_VERBOSE = 'true';
    }
    // ... other pre-action logic
});

cli.command('add')
   .setDescription('Add a new private key')
   .setAction(async (options, args) => {
       // Your command logic here
   });

cli.command('get')
   .option('-a, --alias <name>', 'key alias to fetch')
   .setDescription('Get a stored key')
   .setAction(async (options, args) => {
       // options.alias will contain the alias value
   });

// Parse and execute
await cli.parse();
*/