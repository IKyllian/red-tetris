import { defaultCell, ICell, ISize } from "../type/cell.interface";
import { Board } from "./board"
import { ITetromino, IPosition, O_TetrominoShape } from '../type/tetromino.interface';
import { CellType } from '../type/cell.interface';
import { Piece } from "./piece";

describe('board', () => {
    let board: Board
    const size: ISize = {columns: 15, rows: 15}
    beforeEach(() => {
		board = new Board(size);
	});

    describe('buildBoard', () => {
        it('should return a board object with a size that depends of params with default cells', () => {
            const size = { rows: 20, columns: 10 };
            const colums = Array.from({ length: size.columns }, () => ({ ...defaultCell }))
            const newBoard = board.buildBoard(size);
            expect(newBoard.length).toBe(size.rows);
            expect(newBoard[0].length).toBe(size.columns);
            expect(newBoard[0]).toEqual(expect.arrayContaining(colums));
        })
    })

    describe('transferPieceToBoard', () => {
        const tetromino: ITetromino = { type: CellType.O, position: { x: 1, y: 1 } };
        const piece = new Piece(tetromino);
        it('should transfer the piece to the board without fixing it', () => {
            board.transferPieceToBoard(piece, O_TetrominoShape, false);
            expect(board['cells'][1][1]).toEqual({ type: CellType.O, occupied: false });
            expect(board['cells'][1][2]).toEqual({ type: CellType.O, occupied: false });
            expect(board['cells'][2][1]).toEqual({ type: CellType.O, occupied: false });
            expect(board['cells'][2][2]).toEqual({ type: CellType.O, occupied: false });
        });
    
        it('should transfer the piece to the board and fix it', () => {
            board.transferPieceToBoard(piece, O_TetrominoShape, true);
            expect(board['cells'][1][1]).toEqual({ type: CellType.O, occupied: true });
            expect(board['cells'][1][2]).toEqual({ type: CellType.O, occupied: true });
            expect(board['cells'][2][1]).toEqual({ type: CellType.O, occupied: true });
            expect(board['cells'][2][2]).toEqual({ type: CellType.O, occupied: true });
        });   
    })

    describe('checkForLines', () => {
        it ('full empty lines, should return 0', () => {
            expect(board.checkForLines()).toBe(0);
        })
        it ('lines partly filled, should return 0', () => {
            // fill some cells to occupied
            for(let i = size.columns - 2; i >= 0; i--) {
                board['cells'][size.rows - 1][i].occupied = true; 
                board['cells'][size.rows - 2][i].occupied = true; 
            }
            expect(board.checkForLines()).toBe(0);
        })
        it('one line complete, should return 1', () => {
            const colums = Array.from({ length: size.columns }, () => ({ ...defaultCell }))

            // fill last line to occupied
            for(let i = size.columns - 1; i >= 0; i--) {
                board['cells'][size.rows - 1][i].occupied = true; 
            }
            expect(board.checkForLines()).toBe(1);
            expect(board['cells'][size.rows - 1]).toEqual(expect.arrayContaining(colums))
        })
        it('multiple lines complete', () => {
            // fill multiple lines to occupied
            for(let i = size.columns - 1; i >= 0; i--) {
                board['cells'][size.rows - 1][i].occupied = true;
                board['cells'][size.rows - 2][i].occupied = true;
                board['cells'][size.rows - 3][i].occupied = true;
            }
            expect(board.checkForLines()).toBe(3);
        })
        it('line complete but not destructible, should return 0', () => {
            const colums = Array.from({ length: size.columns }, () => ({ ...defaultCell, occupied: true, type: CellType.INDESTRUCTIBLE }))
            // fill multiple lines to occupied
            for(let i = size.columns - 1; i >= 0; i--) {
                board['cells'][size.rows - 1][i].occupied = true; 
                board['cells'][size.rows - 1][i].type = CellType.INDESTRUCTIBLE;
            }
            expect(board.checkForLines()).toBe(0);
            expect(board['cells'][size.rows - 1]).toEqual(expect.arrayContaining(colums))
        })
    })

    describe('addIndestructibleLine', () => {
        
        it('should add addIndestructibleLine', () => {
            board['cells'][1][0].occupied = true // Juste pour avoir une ligne differente
            const prevSecondRow = board['cells'][1]
            const indestructibleRow: ICell[] = Array.from(
                { length: size.columns },
                () => ({
                    occupied: true,
                    type: CellType.INDESTRUCTIBLE,
                })
            );
    
            board.addIndestructibleLine()
            expect(board['cells'][1]).not.toEqual(prevSecondRow);
            expect(board['cells'][0]).toEqual(prevSecondRow);
            expect(board['cells'][size.rows - 1]).toEqual(indestructibleRow);
        })
    })

    describe('checkCollision', () => {
        const shape = O_TetrominoShape;
        it('should return false for no collision', () => {
            const position: IPosition = { x: 1, y: 1 };

            const result = board.checkCollision(position, shape);
            expect(result).toBe(false);
        });

        it('should return true for collision with board boundaries', () => {
            const position: IPosition = { x: 14, y: 14 };

            const result = board.checkCollision(position, shape);
            expect(result).toBe(true);
        });

        it('should return true for collision with occupied cells', () => {
            board['cells'][2][2] = { ...board['cells'][2][2], occupied: true };
            const position: IPosition = { x: 1, y: 1 };

            const result = board.checkCollision(position, shape);
            expect(result).toBe(true);
        });

        it('should handle negative y position correctly', () => {
            const position: IPosition = { x: 1, y: -1 };

            const result = board.checkCollision(position, shape);
            expect(result).toBe(false);
        });

        it('should return true for collision with left boundary', () => {
            const position: IPosition = { x: -1, y: 2 };

            const result = board.checkCollision(position, shape);
            expect(result).toBe(true);
        });

        it('should return true for collision with right boundary', () => {
            const position: IPosition = { x: 14, y: 2 };

            const result = board.checkCollision(position, shape);
            expect(result).toBe(true);
        });    
    })

    
})