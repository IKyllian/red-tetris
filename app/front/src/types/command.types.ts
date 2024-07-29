export enum Commands {
	ROTATE,
	MOVE_DOWN,
	MOVE_LEFT,
	MOVE_RIGHT,
	HARD_DROP,
}

export function getCommand(command: string): Commands | null {
	switch (command) {
		case 'ArrowUp':
			return Commands.ROTATE;
		case 'ArrowDown':
			return Commands.MOVE_DOWN;
		case 'ArrowLeft':
			return Commands.MOVE_LEFT;
		case 'ArrowRight':
			return Commands.MOVE_RIGHT;
		case 'Space':
			return Commands.HARD_DROP;
		default:
			return null;
	}
}
