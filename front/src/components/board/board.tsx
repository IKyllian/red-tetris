import "./board.css"
import { ITetromino } from "../../types/tetrominoes.type"
import { IBoard, ICell } from "../../types/board.types";
import { transferPieceToBoard } from "../../utils/tetromino.utils";
import { buildBoard } from "../../utils/board.utils";
import { isCommandType } from "../../types/command.types";
import { useAppDispatch } from "../../store/hook";
import { commandPressed } from "../../store/lobby.slice";

export interface BoardProps {
    board: IBoard,
    gameIdx: number,
}

const Cell = ({cellClassname}) => {
    return  (
        <div className='cell'>
            <div className={cellClassname}></div>
        </div>
    )
}

export const Board = ({board, gameIdx}: BoardProps) => {
    const dispatch = useAppDispatch();
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
    };
    const resolveKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const code = event.code;
        console.log('code = ', code);
        if (isCommandType(code)) {
            dispatch(commandPressed({command: code, gameIdx}));
        }
    }
    return (
        <div className="board" style={boardStyles} onKeyDown={resolveKeyPress} tabIndex={0}>
            {
                board.cells.map((row) => (
                    row.map((cell, cellIndex) => (
                        <Cell key={cellIndex} cellClassname={cell.className} />
                    ))
                ))
            }
         </div>
    )
}

export function BoardPreview({ board }: { board: IBoard }) {
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
        height: '300px',
        width: '200px'
    };

    return (
        <div className="board board-preview" style={boardStyles} tabIndex={0}>
            {
                board.cells.map((row) => (
                    row.map((cell, cellIndex) => (
                        <Cell key={cellIndex} cellClassname={`${cell.className} + cell-preview`} />
                    ))
                ))
            }
         </div>
    )
}

export function PiecePreview({tetromino} : {tetromino: ITetromino}) {
    const board = buildBoard({ rows: 4, columns: 4 });
    const boardStyles = {
        gridTemplateRows: `repeat(4, 1fr)`,
        gridTemplateColumns: `repeat(4, 1fr)`,
        height: '90px',
        width: '90px'
    };
    const rows = transferPieceToBoard({rows: board.cells, tetromino, position: {x: 0, y: 0}, isOccupied: false});

    return (
        <div className="board" style={boardStyles}>
            {
                rows.map((row) => (
                    row.map((cell: ICell, cellIndex: number) => (
                        <Cell key={cellIndex} cellClassname={cell.className} />
                    ))
                ))
            }
        </div>
    )
}