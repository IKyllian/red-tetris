import _ from 'lodash';
import { IPosition, ITetromino, I_SRS, JLTSZ_SRS, TetrominoType } from '../types/tetrominoes.type';
import { IBoard, ICell, NbOfLinesForNextLevel, defaultCell } from '../types/board.types';
import { ILobby } from '../types/lobby.type';

let newPieceNeeded = false;

export function moveToRight(position: IPosition): IPosition {
    return {...position, x: position.x + 1}
}

export function moveToLeft(position: IPosition): IPosition {
    return {...position, x: position.x - 1}
}

export function moveToBottom(position: IPosition): IPosition {
    return {...position, y: position.y + 1}
}

export function moveDown(lobby: ILobby): void {
    if (!lobby.playerGame) return;
    let game = lobby.playerGame;
    let currentPiece = lobby.pieces[0];
    if (currentPiece) {
        const newPosition = {
            ...currentPiece.position,
            y: currentPiece.position.y + 1,
        };
        const oldDropPosition = getDropPosition(game.board, currentPiece);
        if (oldDropPosition) {
            clearOldPosition({...currentPiece, position: oldDropPosition}, game.board);
        }
        newPieceNeeded = false;
        if (checkCollision(game.board, newPosition, currentPiece.shape)) {
            game.board.cells = transferPieceToBoard(game.board, currentPiece, true);
            newPieceNeeded = true;
            lobby.pieces.shift();
            currentPiece = lobby.pieces[0];
            const linesCleared = checkForLines(game.board);
            if (linesCleared > 0) {
                game.linesCleared += linesCleared;
                if (game.linesCleared >= NbOfLinesForNextLevel) {
                    game.linesCleared -= NbOfLinesForNextLevel; //TODO Not sure
                    game.level++;
                    game.linesCleared = 0;
                }
                game.totalLinesCleared += linesCleared;
            }
            game.board.cells = transferPieceToBoard(game.board, currentPiece, false);
        } else {
            clearOldPosition(currentPiece, game.board);
            const dropPosition = getDropPosition(game.board, {...currentPiece, position: newPosition});
            currentPiece.position = newPosition;
            game.board.cells = transferPieceToBoard(game.board, {...currentPiece, position: dropPosition}, false, 'drop-preview');
            game.board.cells = transferPieceToBoard(game.board, currentPiece, false);
        }
    }
}

export function checkForLines(board: IBoard): number {
    let lines = 0;
    for (let i = board.size.rows - 1; i >= 0; i--) {
        const row = board.cells[i];
        if (row.every((cell) => cell.occupied && cell.isDestructible)) {
            lines++;
            board.cells.splice(i, 1);
            board.cells.unshift(
                Array.from({ length: board.size.columns }, () => ({
                    ...defaultCell,
                }))
            );
            ++i;
        }
    }
    return lines;
}

export function getDropPosition(board: IBoard, piece: ITetromino): IPosition | null {
    if (checkCollision(board, piece.position, piece.shape)) return null
    let newPos = piece.position;
    let nextPos = moveToBottom(newPos);
    while (!checkCollision(board, nextPos, piece.shape)) {
        newPos = nextPos;
        nextPos = moveToBottom(newPos);
    }
    return newPos;
}

export function hardDrop(lobby: ILobby): void {
    while (!newPieceNeeded) {
        moveDown(lobby);
    }
    newPieceNeeded = false;
}

export function getHardDropPos(piece: ITetromino, board: IBoard): IPosition {
    let newPos = piece.position;
    let nextPos = moveToBottom(newPos);
    while (!checkCollision(board, nextPos, piece.shape)) {
        newPos = nextPos;
        nextPos = moveToBottom(newPos);
    }

    return newPos;
}

export function transferPieceToBoard(board: IBoard, tetromino: ITetromino, fixOnBoard: boolean, additionalClassName: string = undefined): ICell[][] {
    let newCells = [...board.cells];
    tetromino.shape.forEach((row: number[], y: number) => {
        if (tetromino.position.y + y < 0) return;
        row.forEach((cell: number, x: number) => {
            if (cell) {
                const _x = x + tetromino.position.x;
                const _y = y + tetromino.position.y;
                if (newCells[_y][_x].occupied) {
                    board.gameOver = true;
                }
                newCells[_y][_x] = {
                    className: tetromino.className + ' ' + additionalClassName,
                    occupied: fixOnBoard,
                    isDestructible: true,
                };
            }
        });
    });
    return newCells
}

export function checkCollision(board: IBoard, position: IPosition, shape: number[][]): boolean {
    let isCollision = false;
    shape.forEach((row: number[], y: number) => {
        if (position.y + y < 0) return;
        row.forEach((cell: number, x: number) => {
            if (cell) {
                const _x = x + position.x;
                const _y = y + position.y;
                if (
                    _x < 0 ||
                    _x >= board.size.columns ||
                    _y >= board.size.rows
                ) {
                    isCollision = true;
                } else if (board.cells[_y][_x].occupied) {
                    isCollision = true;
                }
            }
        });
    });
    return isCollision;
}

export function changeStatePiecePosition(lobby: ILobby, cb: (position: IPosition) => IPosition): void {
    const { pieces, playerGame } = lobby;
    if (!playerGame) return;
    let currentPiece = pieces[0]
    if (currentPiece) {
        const newPos = cb(currentPiece.position);
        const haveCollided = checkCollision(playerGame.board, newPos, currentPiece.shape)
        const oldDropPosition = getDropPosition(playerGame.board, currentPiece);
        
        if (oldDropPosition && !haveCollided) {
            clearOldPosition({...currentPiece, position: oldDropPosition}, playerGame.board);
        }

        if (!haveCollided) {
            const dropPosition = getDropPosition(playerGame.board, {...currentPiece, position: newPos})
            playerGame.board.cells = transferPieceToBoard(playerGame.board, { ...currentPiece, position: dropPosition }, false, 'drop-preview')
            clearOldPosition(currentPiece, playerGame.board);
            playerGame.board.cells = transferPieceToBoard(playerGame.board, { ...currentPiece, position: newPos }, false)
        }
        if (!haveCollided) {
            pieces[0] = { ...currentPiece, position: newPos }
        }
    }
}

export function getRotatedShape(shape: number[][]): number[][] {
    // Transpose the shape matrix (columns become rows)
    const transposed = _.zip(...shape);
    // Reverse each row of the transposed matrix to rotate clockwise
    return transposed.map((row) => row.reverse());
}

function clearOldPosition(tetromino: ITetromino, board: IBoard): void {
    let cells = board.cells;
    tetromino.shape.forEach((row: number[], y: number) => {
        if (tetromino.position.y + y < 0) return;
        row.forEach((cell: number, x: number) => {
            if (cell) {
                const _x = x + tetromino.position.x;
                const _y = y + tetromino.position.y;
                cells[_y][_x] = { ...defaultCell };
            }
        });
    });
}

export function rotate(lobby: ILobby): void {
    if (!(lobby.pieces.length > 0) || !lobby.playerGame) return
    let piece = lobby.pieces[0];
    let board = lobby.playerGame.board;
    if (piece.className === TetrominoType.O) return
    const newShape = getRotatedShape(piece.shape);
    const srs = piece.className === TetrominoType.I ? I_SRS : JLTSZ_SRS;
    const oldDropPosition = getDropPosition(board, piece);
    if (oldDropPosition) {
        clearOldPosition({...piece, position: oldDropPosition}, board);
    }
    for (let position of srs[piece.rotationState]) {
        const newPosition = {
            x: piece.position.x + position.x,
            y: piece.position.y + position.y,
        };
        if (!checkCollision(board, newPosition, newShape)) {
            if (oldDropPosition) {
                clearOldPosition(piece, board);
            }
            clearOldPosition(piece, board);
            piece.position = newPosition;
            piece.shape = newShape;
            const dropPosition = getDropPosition(board, piece);
            board.cells = transferPieceToBoard(board, {...piece, position: dropPosition}, false, 'drop-preview');
            board.cells = transferPieceToBoard(board, piece, false);
            piece.rotationState = (piece.rotationState + 1) % 4;
            break;
        }
    }
}