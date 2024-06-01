import "./board.css";
import { ITetromino } from "../../types/tetrominoes.type";
import { IBoard, ICell } from "../../types/board.types";
import { buildBoard } from "../../utils/board.utils";
import {
	getShape,
	getTetrominoClassName,
	transferPieceToBoard,
	// transferPieceToBoard,
} from "../../utils/piece.utils";
import { useMemo } from "react";
interface BoardProps {
	board: IBoard;
	playerName: string;
	isGameOver: boolean;
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

export const Board = ({ board, playerName, isGameOver }: BoardProps) => {
	// console.log("GAME OVER", gameOver);
	// const { fps } = useTick(game, gameOver, seed);
	// const boardStyles = {
	// 	gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
	// 	gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
	// };
	const boardStyles = useMemo(
		() => ({
			gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
			gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
		}),
		[board.size]
	);

	return (
		<>
			<div className="board" style={boardStyles} tabIndex={0}>
				{isGameOver && <span className="gameOver"> Game Over </span>}
				{board.cells.map((row) =>
					row.map((cell, cellIndex) => (
						<Cell
							key={cellIndex}
							cellClassname={getTetrominoClassName(
								cell.type,
								cell.isPreview
							)}
						/>
					))
				)}
			</div>
			<span style={{ fontSize: "25px", color: "red" }}>
				{" "}
				{playerName}{" "}
			</span>
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

	// console.info("Game Over = ", isGameOver);
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
							cellClassname={getTetrominoClassName(
								cell.type,
								cell.isPreview
							)}
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

	const shape = getShape(tetromino.type, tetromino.rotationState);
	const rows = transferPieceToBoard(
		board,
		{ ...tetromino, position: { x: 0, y: 0 } },
		shape,
		false
	);
	return (
		<div className="board" style={boardStyles}>
			{rows.map((row) =>
				row.map((cell: ICell, cellIndex: number) => (
					<Cell
						key={cellIndex}
						cellClassname={getTetrominoClassName(
							cell.type,
							cell.isPreview
						)}
					/>
				))
			)}
		</div>
	);
}
