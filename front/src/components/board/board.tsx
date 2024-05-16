import "./board.css"
import { ITetromino } from "../../types/tetrominoes.type"
import { IBoard, ICell, IGame } from "../../types/board.types";
import { buildBoard } from "../../utils/board.utils";
import { isCommandType } from "../../types/command.types";
import { useAppDispatch } from "../../store/hook";
import { commandPressed } from "../../store/lobby.slice";
import { transferPieceToBoard } from "../../utils/piece.utils"
import { useTick } from "../../hooks/useTick";
interface BoardProps {
    board: IBoard,
    isGameOver: boolean,
    game: IGame
}

interface BoardPreviewProps {
    board: IBoard,
    playerName: string,
    isGameOver: boolean
}

const Cell = ({ cellClassname }) => {
    return (
        <div className='cell'>
            <div className={cellClassname}></div>
        </div>
    )
}

export const Board = ({ board, isGameOver, game}: BoardProps) => {
    const { tick } = useTick(game);
    const dispatch = useAppDispatch();
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
    };
    const resolveKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const code = event.code;
        if (isCommandType(code) && !isGameOver) {
            dispatch(commandPressed({ command: code }));
        }
    }

    return (
        <>
            <span  style={{fontSize: "25px", color: "red"}}> { tick }  </span>
            <div className="board" style={boardStyles} onKeyDown={resolveKeyPress} tabIndex={0}>
                {
                    board.cells.map((row) => (
                        row.map((cell, cellIndex) => (
                            <Cell key={cellIndex} cellClassname={cell.className} />
                        ))
                    ))
                }
            </div>
        </>
    )
}

export function BoardPreview({ board, playerName, isGameOver }: BoardPreviewProps) {
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
        height: '300px',
        width: '200px'
    };

    console.info("Game Over = ", isGameOver)
    return (
        <div className="board-preview-container flex flex-col items-center gap8">
            <span> {playerName} </span>
            <div className="board board-preview" style={boardStyles} tabIndex={0}>
                { isGameOver && <span className="gameOver" > Game Over </span>}
                {
                    board.cells.map((row) => (
                        row.map((cell, cellIndex) => (
                            <Cell key={cellIndex} cellClassname={`${cell.className} + cell-preview`} />
                        ))
                    ))
                }
            </div>
        </div>
    )
}

export function PiecePreview({ tetromino}: { tetromino: ITetromino }) {
    const board = buildBoard({ rows: 4, columns: 4 });
    const boardStyles = {
        gridTemplateRows: `repeat(4, 1fr)`,
        gridTemplateColumns: `repeat(4, 1fr)`,
        height: '90px',
        width: '90px'
    };

    const rows = transferPieceToBoard(board, {...tetromino, position: { x: 0, y: 0 }}, false );
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