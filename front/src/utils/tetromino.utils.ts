import { TETROMINOES } from "../types/tetrominoes.type";
import _ from 'lodash';

export const transferPieceToBoard = ({rows, tetromino, position, isOccupied}) => {
    console.info("rows = ", rows)
    let newRows = _.cloneDeep(rows);
    tetromino.shape.forEach((row: number[], y: number) => {
        row.forEach((cell: number, x: number) => {
            // console.log(cell)
            if (cell) { // cell is 0 or 1
                // console.log("X = ", x, " - Position X = ", position.x," - Y = ", y, " Position Y = ", position.y);
                const occupied = isOccupied;
                const _x = x + position.x;
                const _y = y + position.y;
                console.info("X = ", _x, " - Position Y = ", _y)
                newRows[_y][_x] = {className: tetromino.className, occupied }
            }
        })
    })
    return newRows;
}

export const getRandomPiece = () => {
    const keys = Object.keys(TETROMINOES);
    const randomIndex = Math.floor(Math.random() * keys.length);
    const tetromino = TETROMINOES[keys[randomIndex]];
    return tetromino;
}

// Rotate 2d array -> https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
export const rotatePiece = (shape: number[][]) => {
    // console.log("Shape Before Rotation: ", shape);
    // const newPiece = shape.map((_, index) => {
    //     console.log("Index: ", index);
    //     return shape.map((column) => {
    //         console.log("Column: ", column);
    //         console.log("Column: ", column[index]);
    //         return column[index]
    //     })
    // });
    const newPiece = _.zip(...shape)
    return newPiece.map((row) => row.reverse());
}