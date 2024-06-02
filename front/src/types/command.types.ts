export enum COMMANDS {
	KEY_UP = 'ArrowUp',
	KEY_DOWN = 'ArrowDown',
	KEY_LEFT = 'ArrowLeft',
	KEY_RIGHT = 'ArrowRight',
	KEY_SPACE = 'Space',
}

export type Command =
	| COMMANDS.KEY_UP
	| COMMANDS.KEY_DOWN
	| COMMANDS.KEY_LEFT
	| COMMANDS.KEY_RIGHT
	| COMMANDS.KEY_SPACE;

//Liste des commandes
export const commands: Command[] = [
	COMMANDS.KEY_UP,
	COMMANDS.KEY_DOWN,
	COMMANDS.KEY_LEFT,
	COMMANDS.KEY_RIGHT,
	COMMANDS.KEY_SPACE,
];

// Check si la valeur reçu est de type Command
export const isCommandType = (x: any): x is Command => commands.includes(x);
