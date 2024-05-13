import _ from 'lodash';
import { IPosition, ITetromino, I_SRS, JLTSZ_SRS, TetrominoType } from '../types/tetrominoes.type';
import { IBoard } from '../../../back/dist/type/board.interface';
import { ICell, IGame, NbOfLinesForNextLevel, defaultCell } from '../types/board.types';
import { ILobby } from '../types/lobby.type';

// function getRotatedShape(): number[][] {
//     // Transpose the shape matrix (columns become rows)
//     const transposed = zip(...this.shape);
//     // Reverse each row of the transposed matrix to rotate clockwise
//     return transposed.map((row) => row.reverse());
// }

// export function rotate(board: Board): void {
//     if (this.className === TetrominoType.O) {
//         return;
//     }
//     const newShape = this.getRotatedShape();
//     const srs = this.className === TetrominoType.I ? I_SRS : JLTSZ_SRS;
//     for (let position of srs[this.rotationState]) {
//         const newPosition = {
//             x: this.position.x + position.x,
//             y: this.position.y + position.y,
//         };
//         if (!board.checkCollision(newPosition, newShape)) {
//             board.clearOldPosition(this);
//             this.position = newPosition;
//             this.shape = newShape;
//             board.transferPieceToBoard(this, false);
//             this.rotationState = (this.rotationState + 1) % 4;
//             break;
//         }
//     }
// }

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

export function moveDown(game: IGame): IGame {
    // this.tickToMoveDown = 0;
    const newGame = {...game};
    const currentPiece = newGame.pieces[0];
    const newPosition = {
        ...currentPiece.position,
        y: currentPiece.position.y + 1,
    };
    if (checkCollision(newGame.board, newPosition, currentPiece.shape)) {
        // newGame.board.transferPieceToBoard(this.currentPiece, true);
        newGame.board.cells = transferPieceToBoard(newGame.board, currentPiece, true);
        // this.newPieceNeeded = true;
        // this.currentPiece = this.pieces[1];
        // this.nbOfpieceDown++;
        const linesCleared = checkForLines(newGame.board);
        if (linesCleared > 0) {
            // this.destructibleLinesToGive = linesCleared - 1;
            newGame.linesCleared += linesCleared;
            if (newGame.linesCleared >= NbOfLinesForNextLevel) {
                newGame.linesCleared -= NbOfLinesForNextLevel; //TODO Not sure
                newGame.level++;
                newGame.linesCleared = 0;
            }
            // let lineScore = 0;
            // if (linesCleared <= this.lineScores.length) {
            //     lineScore =
            //         this.lineScores[linesCleared - 1] * (newGame.level + 1);
            // }
            // this.score += lineScore;
            newGame.totalLinesCleared += linesCleared;
        }
        // add new piece to the board
        // newGame.board.transferPieceToBoard(this.currentPiece, false);
        newGame.board.cells = transferPieceToBoard(newGame.board, currentPiece, false);
    } else {
        newGame.board.cells = clearOldPosition(currentPiece, newGame.board);
        currentPiece.position = newPosition;
        newGame.board.cells = transferPieceToBoard(newGame.board, currentPiece, false);
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

// export function hardDrop(position: IPosition): IPosition {
//     do const newPos = moveToBottom(game.pieces[0].position);
// }

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

export function changeStatePiecePosition(state: ILobby, gameIdx: number, cb: (position: IPosition) => IPosition): ILobby {
    return Object.assign(state, {
        ...state,
        games: [...state.games.map((game, idx) => {
            if (idx === gameIdx) {
                const newPos = cb(game.pieces[0].position);
                const haveCollided = checkCollision(game.board, newPos, game.pieces[0].shape)
                if (haveCollided) {
                    return game;
                }
                game.board.cells = clearOldPosition(game.pieces[0], game.board);
                return {
                    ...game,
                    pieces: [...game.pieces.map((piece, idx) => {
                        if (idx === 0) {
                            return { ...piece, position: newPos }
                        } else {
                            return piece;
                        }
                    })],
                    board: Object.assign(game.board, {
                        ...game.board,
                        cells: transferPieceToBoard(game.board, { ...game.pieces[0], position: newPos }, false)
                    })
                }
            }
            return game;
        })],
    })
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
    // do {
    //     newPos = nextPosition;
    //     nextPosition = moveToBottom(newPos);
    // } while (!checkCollision(board, nextPosition, piece.shape))

    return newPos;
}