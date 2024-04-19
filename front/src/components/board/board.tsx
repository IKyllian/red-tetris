import "./board.css"
import { IPosition, ITetromino, defaultPosition } from "../../types/tetrominoes.type"
import { ICell, ISize } from "../../types/board.types";
import { getRandomPiece, rotatePiece, transferPieceToBoard } from "../../utils/tetromino.utils";
import { useEffect, useState } from "react";
import { useInterval } from "../../hooks/useInterval";
import { buildBoard } from "../../utils/board.utils";
import { isCommandType } from "../../types/command.types";
import { useAppDispatch } from "../../store/hook";
import { commandPressed } from "../../store/socket.slice";

export interface BoardProps {
    size: ISize,
}

const Cell = ({cell}) => (
    <div className='cell'>
        <div className={cell.className}></div>
    </div>
)

// Return false if there is no colision
const checkColision = (rowsSize, boardRows, position) => {
    // console.log("position.y = ", position.y, " rowsSize - 1 = ", rowsSize - 1);
    console.log(boardRows);
    if (!(position.y < rowsSize - 1)) {
        return true;
    }
    // else if (!boardRows[position.y][position.x].occupied){
    //     return false;
    // }
    return false;
}

export function Board({size} : BoardProps) {
    const [currentPiece, setCurrentPiece] = useState(getRandomPiece());
    const [position, setPosition] = useState<IPosition>(defaultPosition);
    const [board, setBoard] = useState(buildBoard({ rows: size.rows, columns: size.columns }));
    const [prevBoard, setPrevBoard] = useState(buildBoard({ rows: size.rows, columns: size.columns }));
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
    };
    const dispatch = useAppDispatch();

    useEffect(() => {
        setBoard(prev => ({...prev, rows: transferPieceToBoard({rows: board.cells, tetromino: currentPiece, position, isOccupied: false})}));
    }, [])

    const generateNewPieceToBoard = () => {
        if (checkColision(size.rows, board.cells, position)) {
            // console.log("colision");
            const newBoard = transferPieceToBoard({rows: prevBoard.cells, tetromino: currentPiece, position : {...position, y: position.y - 1}, isOccupied: true});
            // setBoard(prev => ({...prev, rows: newBoard}));
            setPrevBoard(prev => ({...prev, cells: newBoard}));
            const newPiece = getRandomPiece();
            setPosition(defaultPosition);
            setCurrentPiece(newPiece);
            // console.log(newBoard);
            setBoard(prev => ({...prev, cells: transferPieceToBoard({rows: newBoard, tetromino: newPiece, position: defaultPosition, isOccupied: false})}));
        } else {
            setBoard(prev => ({...prev, cells: transferPieceToBoard({rows: prevBoard.cells, tetromino: currentPiece, position, isOccupied: false})}));
            setPosition(prev => ({...prev, y: prev.y + 1}));
        }
    }
    useInterval(() => generateNewPieceToBoard(), 1000);
    

    const resolveKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const code = event.code;
        console.log(code);
        if (isCommandType(code)) {
            dispatch(commandPressed(code));
        }
    }
    return (
        <div className="board" style={boardStyles} onKeyDown={resolveKeyPress} tabIndex={0}>
            {
                board.cells.map((row) => (
                    row.map((cell, cellIndex) => (
                        <Cell key={cellIndex} cell={cell} />
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

    const rows = transferPieceToBoard({rows: board.cells, tetromino: tetrominoState, position: {x: 0, y: 0}, isOccupied: false});
    return (
        <div className="board" style={boardStyles} onClick={() => onClick()}>
            {
                rows.map((row) => (
                    row.map((cell: ICell, cellIndex: number) => (
                        <Cell key={cellIndex} cell={cell} />
                    ))
                ))
            }
        </div>
    )
}