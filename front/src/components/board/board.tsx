import "./board.css"
import { ITetromino } from "../../types/tetrominoes-type"
import { ICell } from "../../types/board-types";
import { getRandomPiece, rotatePiece, transferPieceToBoard } from "../../utils/tetromino-utils";
import { useEffect, useState } from "react";
import { useInterval } from "../../hooks/useInterval";

export interface BoardProps {
    rowsSize: number;
    columnsSize: number;
}

interface IPosition {
    x: number;
    y: number;
}

const defaultCell: ICell = {
    occupied: false,
    className: ""
};


const defaultPosition: IPosition = {
    x: 3,
    y: 0
}

const buildBoard = ({ rows, columns }) => {
    const builtRows = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => ({ ...defaultCell }))
    );
  
    return {
      rows: builtRows,
      size: { rows, columns }
    };
};

const Cell = ({cell, cellIndex}) => (
    <div className='cell'key={cellIndex}>
        <div className={cell.className}></div>
    </div>
)

// Return false if there is no colision
const checkColision = (rowsSize, boardRows, position) => {
    console.log("position.y = ", position.y, " rowsSize - 1 = ", rowsSize - 1);
    console.log(boardRows);
    if (!(position.y < rowsSize - 1)) {
        return true;
    }
    // else if (!boardRows[position.y][position.x].occupied){
    //     return false;
    // }
    return false;
}

export function Board({rowsSize, columnsSize} : BoardProps) {
    const [currentPiece, setCurrentPiece] = useState(getRandomPiece());
    const [position, setPosition] = useState<IPosition>(defaultPosition);
    const [board, setBoard] = useState(buildBoard({ rows: rowsSize, columns: columnsSize }));
    console.log(board)
    const [prevBoard, setPrevBoard] = useState(buildBoard({ rows: rowsSize, columns: columnsSize }));
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
    };
    useEffect(() => {
        setBoard(prev => ({...prev, rows: transferPieceToBoard({rows: board.rows, tetromino: currentPiece, position, isOccupied: false})}));
    }, [])

    console.log("PREV = ", prevBoard.rows);

    const generateNewPieceToBoard = () => {
        if (checkColision(rowsSize, board.rows, position)) {
            console.log("colision");
            const newBoard = transferPieceToBoard({rows: prevBoard.rows, tetromino: currentPiece, position : {...position, y: position.y - 1}, isOccupied: true});
            // setBoard(prev => ({...prev, rows: newBoard}));
            setPrevBoard(prev => ({...prev, rows: newBoard}));
            const newPiece = getRandomPiece();
            setPosition(defaultPosition);
            setCurrentPiece(newPiece);
            console.log(newBoard);
            setBoard(prev => ({...prev, rows: transferPieceToBoard({rows: newBoard, tetromino: newPiece, position: defaultPosition, isOccupied: false})}));
        } else {
            // console.log(prevBoard.rows);
            setBoard(prev => ({...prev, rows: transferPieceToBoard({rows: prevBoard.rows, tetromino: currentPiece, position, isOccupied: false})}));
            setPosition(prev => ({...prev, y: prev.y + 1}));
        }
        // if (position.y < rowsSize - 1) {
        //     setBoard(prev => ({...prev, rows: transferPieceToBoard({rows: prevBoard.rows, tetromino: currentPiece, position, isOccupied: false})}));
        // } else {
        //     const newPiece = getRandomPiece();
        //     setPosition(defaultPosition);
        //     setCurrentPiece(newPiece);
        //     setBoard(prev => ({...prev, rows: transferPieceToBoard({rows: board.rows, tetromino: newPiece, position: defaultPosition, isOccupied: false})}));
        // }
    }
    useInterval(() => generateNewPieceToBoard(), 1000);
    
    return (
        <div className="board" style={boardStyles}>
            {
                board.rows.map((row) => (
                    row.map((cell, cellIndex) => (
                        <Cell cell={cell} cellIndex={cellIndex} />
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
        const newShape = rotatePiece(tetrominoState.shape);
        setTetrominoState(prev => ({...prev, shape: newShape }));
    }

    const rows = transferPieceToBoard({rows: board.rows, tetromino: tetrominoState, position: {x: 0, y: 0}, isOccupied: false});
    return (
        <div className="board" style={boardStyles} onClick={() => onClick()}>
            {
                rows.map((row) => (
                    row.map((cell: ICell, cellIndex: number) => (
                        <Cell cell={cell} cellIndex={cellIndex} />
                    ))
                ))
            }
        </div>
    )
}