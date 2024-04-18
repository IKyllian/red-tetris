// interface ICell {
//     occupied: boolean;
//     className: string;
//     isDestructible: boolean;
// }

// interface ISize {
//     columns: number;
//     rows: number;
// }

// // interface ITetromino {
// //     shape: number[][];
// //     className: string;
// // }

// class Board {
//     private cells: ICell[][];
//     private size: ISize;

//     transferPieceToBoard = ({rows, tetromino, position, isOccupied}) => {
//         let newRows = _.cloneDeep(rows);
//         tetromino.shape.forEach((row: number[], y: number) => {
//             row.forEach((cell: number, x: number) => {
//                 // console.log(cell)
//                 if (cell) { // cell is 0 or 1
//                     // console.log("X = ", x, " - Position X = ", position.x," - Y = ", y, " Position Y = ", position.y);
//                     const occupied = isOccupied;
//                     const _x = x + position.x;
//                     const _y = y + position.y;
//                     newRows[_y][_x] = {className: tetromino.className, occupied }
//                 }
//             })
//         })
//     }
// }

// class Piece { // Ou Tetromino
//     private shape: number[][];
//     private className: string;

//     rotatePiece(shape: number[]): void { }   
// }

// class Player {
//     public name: string;    
// }


// class Game {
//     private board: Board;
//     private player: Player;
//     private score: number;
//     // private level: number;
// }

// class Lobby {
//     private games: Game[];
//     private lobbyId: string;
//     private pieces: Piece[];
//     // is started: boolean; ????
// }


