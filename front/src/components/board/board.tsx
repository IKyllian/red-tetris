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

export const Board = ({ board, playerName, isGameOver, nextPieces }: BoardProps) => {
	const boardStyles = useMemo(
		() => ({
			gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
			gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
		}),
		[board.size]
	);

	return (
		<>
		<div className="board-container flex flex-row">
			<div className="flex flex-col">
				<div className="board board-border" style={boardStyles} tabIndex={0}>
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
				<span style={{ fontSize: "25px", color: "red", textAlign: 'center' }}>
					{playerName}
				</span>
			</div>
			<div className="board-box-container">
				<div className="box-title"> NEXT </div>
				<div className="flex flex-col box-border">
					{
						nextPieces.map((piece, index) => (
							<PiecePreview key={index} tetromino={piece} />
						))
					}
				</div>
			</div>
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

export function PiecePreview({ tetromino }: { tetromino: ITetromino }) {
	const board = buildBoard({ rows: 4, columns: 4 });
	const boardStyles = {
		gridTemplateRows: `repeat(4, 1fr)`,
		gridTemplateColumns: `repeat(4, 1fr)`,
		height: "170px",
		width: "170px",
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
					<div key={cellIndex} className="cell-piece-preview">
						<div className={getTetrominoClassName(
							cell.type,
							cell.isPreview
						)}>
						</div>
					</div>
				))
			)}
		</div>
	);
}
