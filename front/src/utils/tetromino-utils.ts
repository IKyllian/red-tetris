import { TETROMINOES } from "../types/tetrominoes-type";

export const transferPieceToBoard = ({rows, tetromino, position, isOccupied}) => {
    tetromino.shape.forEach((row: number[], y: number) => {
        row.forEach((cell: number, x: number) => {
            // console.log(cell)
            if (cell) { // cell is 0 or 1
                // console.log("X = ", x, " - Position X = ", position.x," - Y = ", y, " Position Y = ", position.y);
                const occupied = isOccupied;
                const _x = x + position.x;
                const _y = y + position.y;
                rows[_y][_x] = {className: tetromino.className, occupied }
            }
        })
    })
    return rows;
}

export const getRandomPiece = () => {
    const keys = Object.keys(TETROMINOES);
    const randomIndex = Math.floor(Math.random() * keys.length);
    const tetromino = TETROMINOES[keys[randomIndex]];
    return tetromino;
}

// Rotate 2d array -> https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
export const rotatePiece = (shape: number[][], direction: number) => {
    // console.log("Shape Before Rotation: ", shape);
    const newPiece = shape.map((_, index) =>
        shape.map((column) => column[index])
    );

    console.log("Shape After Rotation (1): ", newPiece)
    if (direction > 0) {
        return newPiece.map((row) => row.reverse());
    }
    
    return newPiece.reverse();
}