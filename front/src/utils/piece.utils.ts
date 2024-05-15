import _ from 'lodash';
import { IPosition, ITetromino, I_SRS, JLTSZ_SRS, TetrominoType } from '../types/tetrominoes.type';
import { IBoard } from '../../../back/dist/type/board.interface';
import { ICell, IGame, NbOfLinesForNextLevel, defaultCell } from '../types/board.types';
import { ILobby } from '../types/lobby.type';

let newPieceNeeded = false;

export function moveToRight(position: IPosition): IPosition {
    console.log('Pos = ', position);
    return {...position, x: position.x + 1}
}

export function moveToLeft(position: IPosition): IPosition {
    console.log('Pos = ', position);
    return {...position, x: position.x - 1}
}

export function moveToBottom(position: IPosition): IPosition {
    console.log('Pos = ', position);
    return {...position, y: position.y + 1}
}

export function moveDown(game: IGame, lobby: ILobby): IGame {
    const newGame = {...game};
    let currentPiece = lobby.pieces[0];
    if (currentPiece) {
        const newPosition = {
            ...currentPiece.position,
            y: currentPiece.position.y + 1,
        };
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
            currentPiece.position = newPosition;
            newGame.board.cells = transferPieceToBoard(newGame.board, currentPiece, false);
        }
    }
    return newGame;
}

export function checkForLines(board: IBoard) {
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

export function hardDrop(game: IGame, lobby: ILobby) {
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

export function transferPieceToBoard(board: IBoard, tetromino: ITetromino, fixOnBoard: boolean): ICell[][] {
    let newCells = [...board.cells];
    tetromino.shape.forEach((row: number[], y: number) => {
        if (tetromino.position.y + y < 0) return;
        row.forEach((cell: number, x: number) => {
            if (cell) {
                // cell is 0 or 1
                // console.log("X = ", x, " - Position X = ", position.x," - Y = ", y, " Position Y = ", position.y);
                const _x = x + tetromino.position.x;
                const _y = y + tetromino.position.y;
                // if (newCells[_y][_x].occupied) {
                //     this.gameOver = true;
                // }
                newCells[_y][_x] = {
                    className: tetromino.className,
                    occupied: fixOnBoard,
                    isDestructible: true,
                };
            }
        });
    });
    // console.log("newCells = ", newCells);
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
    // console.log("isCollision : ", isCollision)
    return isCollision;
}

export function changeStatePiecePosition(lobby: ILobby, cb: (position: IPosition) => IPosition): ILobby {
    console.log("LOBBBBYYYYY = ", lobby.pieces)
    const { pieces, playerGame } = lobby;
    const currentPiece = pieces[0]
    if (currentPiece) {
        const newPos = cb(currentPiece.position);
        let newPlayerGame = playerGame
        const haveCollided = checkCollision(playerGame.board, newPos, currentPiece.shape)
        if (!haveCollided) {
            playerGame.board.cells = clearOldPosition(currentPiece, playerGame.board);
            newPlayerGame =  {
                ...playerGame,
                board: Object.assign(playerGame.board, {
                    ...playerGame.board,
                    cells: transferPieceToBoard(playerGame.board, { ...currentPiece, position: newPos }, false)
                })
            }
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
    if (piece.className === TetrominoType.O) {
        return;
    }
    const newPiece = {...piece}
    const newShape = getRotatedShape(newPiece.shape);
    const srs = newPiece.className === TetrominoType.I ? I_SRS : JLTSZ_SRS;
    for (let position of srs[newPiece.rotationState]) {
        const newPosition = {
            x: newPiece.position.x + position.x,
            y: newPiece.position.y + position.y,
        };
        if (!checkCollision(board, newPosition, newShape)) {
            board.cells = clearOldPosition(newPiece, board);
            newPiece.position = newPosition;
            newPiece.shape = newShape;
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