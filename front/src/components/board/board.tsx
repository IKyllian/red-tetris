import "./board.css"
import { ITetromino } from "../../types/tetrominoes.type"
import { IBoard, ICell, IGame } from "../../types/board.types";
import { transferPieceToBoard as transferPieceToBoard2} from "../../utils/tetromino.utils";
import { buildBoard } from "../../utils/board.utils";
import { isCommandType } from "../../types/command.types";
import { useAppDispatch } from "../../store/hook";
import { commandPressed } from "../../store/lobby.slice";
import { getDownPosition, transferPieceToBoard } from "../../utils/piece.utils"
import { useTick } from "../../hooks/useTick";
import { useEffect } from "react";
interface BoardProps {
    board: IBoard,
    gameIdx: number,
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

export const Board = ({ board, gameIdx, isGameOver, game}: BoardProps) => {
    const dispatch = useAppDispatch();
    const [updateState] = useTick(game, gameIdx);
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
    };
    const resolveKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const code = event.code;
        console.log('code = ', code);
        if (isCommandType(code) && !isGameOver) {
            dispatch(commandPressed({ command: code, gameIdx }));
        }
    }

    useEffect(() => {
        updateState()
    }, [])

    // const findDownPos = getDownPosition(board, currentPiece)
    // console.info("findDownPos = ", findDownPos)
    // const newBoard = {...board, cells: transferPieceToBoard2({rows: board.cells, tetromino: currentPiece, position: findDownPos, isOccupied: false})};
    // const newBoard = {...board, cells: transferPieceToBoard(board, {...currentPiece, position: findDownPos }, false)};
    // const rows = transferPieceToBoard({ rows: board.cells, tetromino, position: { x: 0, y: 0 }, isOccupied: false });
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

export function PiecePreview({ tetromino }: { tetromino: ITetromino }) {
    console.info("tetromino = ",      tetromino)
    const board = buildBoard({ rows: 4, columns: 4 });
    const boardStyles = {
        gridTemplateRows: `repeat(4, 1fr)`,
        gridTemplateColumns: `repeat(4, 1fr)`,
        height: '90px',
        width: '90px'
    };
    // const rows = transferPieceToBoard({ rows: board.cells, tetromino, position: { x: 0, y: 0 }, isOccupied: false });

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