import "./board.css"
import { ITetromino } from "../../types/tetrominoes-type"
import { ICell } from "../../types/board-types";
import { rotatePiece, transferPieceToBoard } from "../../utils/tetromino-utils";
import { useState } from "react";

export interface BoardProps {
    rows: number;
    columns: number;
}

const defaultCell: ICell = {
    occupied: false,
    className: ""
};

const buildBoard = ({ rows, columns }: BoardProps) => {
    const builtRows = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => ({ ...defaultCell }))
    );
  
    return {
      rows: builtRows,
      size: { rows, columns }
    };
};

export function Board({rows, columns} : BoardProps) {
    const board = buildBoard({ rows, columns });
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
      };
    return (
        <div className="board" style={boardStyles}>
            {
                board.rows.map((row) => (
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
    const [tetrominoState, setTetrominoState] = useState<ITetromino>(tetromino);
    const board = buildBoard({ rows: 4, columns: 4 });
    const boardStyles = {
        gridTemplateRows: `repeat(4, 1fr)`,
        gridTemplateColumns: `repeat(4, 1fr)`,
        height: '90px',
        width: '90px'
    };
    const onClick = () => {
        console.log("tetromino before", tetrominoState.shape);
        const newShape = rotatePiece(tetrominoState.shape, 1);
        setTetrominoState(prev => ({...prev, shape: newShape }));
    }

    const rows = transferPieceToBoard({rows: board.rows, tetromino: tetrominoState, position: {x: 0, y: 0}, isOccupied: false});
    return (
        <div className="board" style={boardStyles} onClick={() => onClick()}>
            {
                rows.map((row) => (
                    row.map((cell: ICell, cellIndex: number) => (
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