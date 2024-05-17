import "./board.css";
import { ITetromino } from "../../types/tetrominoes.type";
import { IBoard, ICell, IGame } from "../../types/board.types";
import { buildBoard } from "../../utils/board.utils";
import { COMMANDS, isCommandType } from "../../types/command.types";
import { useAppDispatch } from "../../store/hook";
import { commandPressed } from "../../store/lobby.slice";
import { transferPieceToBoard } from "../../utils/piece.utils";
import { useTick } from "../../hooks/useTick";
import { useState } from "react";
interface BoardProps {
	board: IBoard;
	game: IGame;
}

interface BoardPreviewProps {
	board: IBoard;
	playerName: string;
	isGameOver: boolean;
}

const Cell = ({ cellClassname }) => {
	return (
		<div className="cell">
			<div className={cellClassname}></div>
		</div>
	);
};

export const Board = ({ board, game }: BoardProps) => {
	const gameOver = board.gameOver
	const { tick, tickToMoveDownRef } = useTick(game, gameOver);
	const [isKeyUpRelease, setIsKeyUpRelease] = useState<boolean>(true)
	const [isKeySpaceRelease, setIsKeySpaceRelease] = useState<boolean>(true)
	const dispatch = useAppDispatch();
	const boardStyles = {
		gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
		gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
	};
	console.log("GAME OVER", gameOver)
	const resolveKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const code = event.code;
		console.log("resolveKeyPress = ", code)
		if (isCommandType(code) && !gameOver) {
			if (code === COMMANDS.KEY_UP) {
				if (!isKeyUpRelease) return;
			    setIsKeyUpRelease(false)
			}
			if (code === COMMANDS.KEY_SPACE) {
				if (!isKeySpaceRelease) return;
			    setIsKeySpaceRelease(false)
			}
			dispatch(commandPressed({ command: code }));
			if (code === COMMANDS.KEY_DOWN) {
				tickToMoveDownRef.current = 0
			}
		}
	};

	const resolveKeyRelease = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const code = event.code;
		if (code === COMMANDS.KEY_UP) {
			setIsKeyUpRelease(true);
		}
		if (code === COMMANDS.KEY_SPACE) {
			setIsKeySpaceRelease(true);
		}
	}

	return (
		<>
			<span style={{ fontSize: "25px", color: "red" }}> {tick} </span>
			<div
				className="board"
				style={boardStyles}
				onKeyDown={resolveKeyPress}
				onKeyUp={resolveKeyRelease}
				tabIndex={0}
			>
				{gameOver && <span className="gameOver"> Game Over </span>}
				{board.cells.map((row) =>
					row.map((cell, cellIndex) => (
						<Cell key={cellIndex} cellClassname={cell.className} />
					))
				)}
			</div>
		</>
	);
};

export function BoardPreview({
	board,
	playerName,
	isGameOver,
}: BoardPreviewProps) {
	const boardStyles = {
		gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
		gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
		height: "300px",
		width: "200px",
	};

	console.info("Game Over = ", isGameOver);
	return (
		<div className="board-preview-container flex flex-col items-center gap8">
			<span> {playerName} </span>
			<div
				className="board board-preview"
				style={boardStyles}
				tabIndex={0}
			>
				{isGameOver && <span className="gameOver"> Game Over </span>}
				{board.cells.map((row) =>
					row.map((cell, cellIndex) => (
						<Cell
							key={cellIndex}
							cellClassname={`${cell.className} + cell-preview`}
						/>
					))
				)}
			</div>
		</div>
	);
}

export function PiecePreview({ tetromino }: { tetromino: ITetromino }) {
	const board = buildBoard({ rows: 4, columns: 4 });
	const boardStyles = {
		gridTemplateRows: `repeat(4, 1fr)`,
		gridTemplateColumns: `repeat(4, 1fr)`,
		height: "90px",
		width: "90px",
	};

	const rows = transferPieceToBoard(
		board,
		{ ...tetromino, position: { x: 0, y: 0 } },
		false
	);
	return (
		<div className="board" style={boardStyles}>
			{rows.map((row) =>
				row.map((cell: ICell, cellIndex: number) => (
					<Cell key={cellIndex} cellClassname={cell.className} />
				))
			)}
		</div>
	);
}
