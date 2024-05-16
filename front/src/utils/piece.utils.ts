import _ from 'lodash';
import { IPosition, ITetromino, I_SRS, JLTSZ_SRS, TetrominoType } from '../types/tetrominoes.type';
import { IBoard, ICell, IGame, NbOfLinesForNextLevel, defaultCell } from '../types/board.types';
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

export function moveDown(game: IGame, lobby: ILobby): IGame {
    let newGame = {...game};
    let currentPiece = lobby.pieces[0];
    if (currentPiece) {
        const newPosition = {
            ...currentPiece.position,
            y: currentPiece.position.y + 1,
        };
        const oldDropPosition = getDropPosition(game.board, currentPiece);
        if (oldDropPosition) {
            newGame.board.cells = clearOldPosition({...currentPiece, position: oldDropPosition}, newGame.board);
        }
        newPieceNeeded = false;
        if (checkCollision(newGame.board, newPosition, currentPiece.shape)) {
            newGame.board.cells = transferPieceToBoard(newGame.board, currentPiece, true);
            newPieceNeeded = true;
            lobby.pieces.shift();
            currentPiece = lobby.pieces[0];
            const linesCleared = checkForLines(newGame.board);
            if (linesCleared > 0) {
                newGame.linesCleared += linesCleared;
                if (newGame.linesCleared >= NbOfLinesForNextLevel) {
                    newGame.linesCleared -= NbOfLinesForNextLevel; //TODO Not sure
                    newGame.level++;
                    newGame.linesCleared = 0;
                }
                newGame.totalLinesCleared += linesCleared;
            }
            newGame.board.cells = transferPieceToBoard(newGame.board, currentPiece, false);
        } else {
            newGame.board.cells = clearOldPosition(currentPiece, newGame.board);
            const dropPosition = getDropPosition(game.board, {...currentPiece, position: newPosition});
            currentPiece.position = newPosition;
            newGame.board.cells = transferPieceToBoard(newGame.board, {...currentPiece, position: dropPosition}, false, 'drop-preview');
            newGame.board.cells = transferPieceToBoard(newGame.board, currentPiece, false);
        }
    }
    return newGame;
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

export function hardDrop(game: IGame, lobby: ILobby): IGame {
    let newGame = game;
    while (!newPieceNeeded) {
        newGame = moveDown(game, lobby);
    }

    return newGame;
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

export function changeStatePiecePosition(lobby: ILobby, cb: (position: IPosition) => IPosition): ILobby {
    const { pieces, playerGame } = lobby;
    const currentPiece = pieces[0]
    if (currentPiece) {
        const newPos = cb(currentPiece.position);
        let newPlayerGame = playerGame
        const oldDropPosition = getDropPosition(newPlayerGame.board, currentPiece);
        
        if (oldDropPosition) {
            newPlayerGame.board.cells = clearOldPosition({...currentPiece, position: oldDropPosition}, newPlayerGame.board);
        }
        const haveCollided = checkCollision(playerGame.board, newPos, currentPiece.shape)
        const dropPosition = !haveCollided ? getDropPosition(newPlayerGame.board, {...currentPiece, position: newPos}) : getDropPosition(newPlayerGame.board, currentPiece)
        newPlayerGame.board.cells = transferPieceToBoard(playerGame.board, { ...currentPiece, position: dropPosition }, false, 'drop-preview')
        if (!haveCollided) {
            playerGame.board.cells = clearOldPosition(currentPiece, playerGame.board);
            newPlayerGame.board.cells = transferPieceToBoard(playerGame.board, { ...currentPiece, position: newPos }, false)
        }
        
        return Object.assign(lobby, {
            ...lobby,
            playerGame: newPlayerGame,
            pieces: [...pieces.map((piece, idx) => {
                if (idx === 0 && !haveCollided) {
                    return { ...piece, position: newPos }
                } else {
                    return piece;
                }
            })],
        })
    }
    return lobby;
}

export function getRotatedShape(shape: number[][]): number[][] {
    // Transpose the shape matrix (columns become rows)
    const transposed = _.zip(...shape);
    // Reverse each row of the transposed matrix to rotate clockwise
    return transposed.map((row) => row.reverse());
}

function clearOldPosition(tetromino: ITetromino, board: IBoard): ICell[][] {
    const newCells = board.cells;
    tetromino.shape.forEach((row: number[], y: number) => {
        if (tetromino.position.y + y < 0) return;
        row.forEach((cell: number, x: number) => {
            if (cell) {
                const _x = x + tetromino.position.x;
                const _y = y + tetromino.position.y;
                newCells[_y][_x] = { ...defaultCell };
            }
        });
    });
    return newCells
}

export function rotate(board: IBoard, piece: ITetromino): ITetromino {
    if (!piece || piece.className === TetrominoType.O) {
        return piece
    }
    const newPiece = {...piece}
    const newShape = getRotatedShape(newPiece.shape);
    const srs = newPiece.className === TetrominoType.I ? I_SRS : JLTSZ_SRS;
    const oldDropPosition = getDropPosition(board, piece);
    if (oldDropPosition) {
        board.cells = clearOldPosition({...piece, position: oldDropPosition}, board);
    }
    for (let position of srs[newPiece.rotationState]) {
        const newPosition = {
            x: newPiece.position.x + position.x,
            y: newPiece.position.y + position.y,
        };
        if (!checkCollision(board, newPosition, newShape)) {
            if (oldDropPosition) {
                board.cells = clearOldPosition(piece, board);
            }
            board.cells = clearOldPosition(newPiece, board);
            newPiece.position = newPosition;
            newPiece.shape = newShape;
            const dropPosition = getDropPosition(board, newPiece);
            board.cells = transferPieceToBoard(board, {...newPiece, position: dropPosition}, false, 'drop-preview');
            board.cells = transferPieceToBoard(board, newPiece, false);
            newPiece.rotationState = (newPiece.rotationState + 1) % 4;
            break;
        }
    }
    return newPiece;
}

export function getDownPosition(board: IBoard, piece: ITetromino): IPosition {
    if (!piece) return { x: 0, y: 0 };
    let newPos = {...piece.position};
    let nextPosition = moveToBottom(newPos);

    while (!checkCollision(board, nextPosition, piece.shape)) {
        newPos = nextPosition;
        nextPosition = moveToBottom(newPos);
    }
    return newPos;
}