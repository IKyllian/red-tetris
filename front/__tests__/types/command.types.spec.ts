import { describe, it, expect } from "vitest";
import { getCommand, Commands } from 'front/types/command.types';

describe('getCommand', () => {
    it('should return Commands.ROTATE for "ArrowUp"', () => {
        expect(getCommand('ArrowUp')).toBe(Commands.ROTATE);
    });

    it('should return Commands.MOVE_DOWN for "ArrowDown"', () => {
    expect(getCommand('ArrowDown')).toBe(Commands.MOVE_DOWN);
    });

    it('should return Commands.MOVE_LEFT for "ArrowLeft"', () => {
    expect(getCommand('ArrowLeft')).toBe(Commands.MOVE_LEFT);
    });

    it('should return Commands.MOVE_RIGHT for "ArrowRight"', () => {
    expect(getCommand('ArrowRight')).toBe(Commands.MOVE_RIGHT);
    });

    it('should return Commands.HARD_DROP for "Space"', () => {
    expect(getCommand('Space')).toBe(Commands.HARD_DROP);
    });

    it('should return null for an unrecognized command', () => {
    expect(getCommand('UnrecognizedCommand')).toBe(null);
    });
})