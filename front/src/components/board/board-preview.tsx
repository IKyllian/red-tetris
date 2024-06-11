import "./board.css";
import { ITetromino } from "front/types/tetrominoes.type";
import { IBoard, ICell } from "front/types/board.types";
import { buildBoard } from "front/utils/board.utils";
import {
	getShape,
	getTetrominoClassName,
	transferPieceToBoard,
} from "front/utils/piece.utils";
import { useMemo } from "react";
interface BoardProps {
	board: IBoard;
	playerName: string;
	isGameOver: boolean;
	currentPiece: ITetromino;
	nextPieces: Array<ITetromino>;
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

export default function BoardPreview({
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
			<div
				className="board board-border board-preview"
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
			<span> {playerName} </span>
		</div>
	);
}