import "./board.css"
import { ITetromino } from "../../types/tetrominoes.type"
import { IBoard, ICell } from "../../types/board.types";
import { transferPieceToBoard } from "../../utils/tetromino.utils";
import { buildBoard } from "../../utils/board.utils";
import { isCommandType } from "../../types/command.types";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { commandPressed } from "../../store/lobby.slice";
import { IPlayer } from "../../types/player.type";

export interface BoardProps {
    board: IBoard,
    playerBoard: IPlayer,
    gameIdx: number,
}

const Cell = ({cell, isBoardOfConnectedPlayer}) => {
    // const classSpec = cell.className.length && isBoardOfConnectedPlayer ? 'tetromino tetromino_spec' : undefined;
    return  (
        <div className='cell'>
            <div className={cell.className}></div>
        </div>
    )
}

export const Board = ({board, playerBoard, gameIdx}: BoardProps) => {
    const playerName = useAppSelector((state) => state.player.name);
    const isBoardOfConnectedPlayer = playerBoard.name === playerName;
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
                        <Cell key={cellIndex} cell={cell} isBoardOfConnectedPlayer={isBoardOfConnectedPlayer} />
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
                        <div key={cellIndex} className='cell'>
                            <div className={cell.className}></div>
                        </div>
                        // <Cell key={cellIndex} cell={cell} />
                    ))
                ))
            }
        </div>
    )
}