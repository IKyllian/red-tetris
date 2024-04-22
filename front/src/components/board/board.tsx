import "./board.css"
import { ITetromino } from "../../types/tetrominoes.type"
import { IBoard, ICell } from "../../types/board.types";
import { transferPieceToBoard } from "../../utils/tetromino.utils";
import { buildBoard } from "../../utils/board.utils";
import { isCommandType } from "../../types/command.types";
import { useAppDispatch } from "../../store/hook";
import { commandPressed } from "../../store/lobby.slice";

export interface BoardProps {
    board: IBoard
}

const Cell = ({cell}) => (
    <div className='cell'>
        <div className={cell.className}></div>
    </div>
)

export const Board = ({board}: BoardProps) => {
    const dispatch = useAppDispatch();
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
    };
    const resolveKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const code = event.code;
        console.log('code = ', code);
        if (isCommandType(code)) {
            dispatch(commandPressed({command: code}));
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
                        <Cell key={cellIndex} cell={cell} />
                    ))
                ))
            }
        </div>
    )
}