import "./board.css"
import { ITetromino } from "../../types/tetrominoes"

interface BoardState {
    rows: number;
    columns: number;
}

interface Cell {
    occupied: boolean;
    className: string;
}

const defaultCell: Cell = {
    occupied: false,
    className: ""
  };

const buildBoard = ({ rows, columns }: BoardState) => {
    const builtRows = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => ({ ...defaultCell }))
    );
  
    return {
      rows: builtRows,
      size: { rows, columns }
    };
};

const transfersToBoard = ({rows, tetromino, position, isOccupied}) => {
    tetromino.shape.forEach((row, y: number) => {
        row.forEach((cell: Cell, x: number) => {
            console.log(cell)
            if (cell) {
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

export function Board({rows, columns} : BoardState) {
    const board = buildBoard({ rows, columns });
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
      };
    return (
        <div className="board" style={boardStyles}>
            {
                board.rows.map((row, rowIndex) => (
                    row.map((cell, cellIndex) => (
                        <div className="cell" key={cellIndex}>
                            <div> {cell.occupied? "X" : "O"} </div>
                        </div>
                    ))
                ))
            }
        </div>
    )
}

export function BoardPreview({tetromino} : {tetromino: ITetromino}) {
    const board = buildBoard({ rows: 4, columns: 4 });
    const boardStyles = {
        gridTemplateRows: `repeat(4, 1fr)`,
        gridTemplateColumns: `repeat(4, 1fr)`,
        height: '180px',
        width: '150px'
    };
    console.log(board)
    const rows = transfersToBoard({rows: board.rows, tetromino, position: {x: 0, y: 0}, isOccupied: false});
    return (
        <div className="board" style={boardStyles}>
            {
                rows.map((row, rowIndex: number) => (
                    row.map((cell: Cell, cellIndex: number) => (
                        // <div className={`cell ${cell.className}`} key={cellIndex}>
                        <div className='cell'key={cellIndex}>
                            <div className={cell.className}></div>
                        </div>
                    ))
                ))
            }
        </div>
    )
}