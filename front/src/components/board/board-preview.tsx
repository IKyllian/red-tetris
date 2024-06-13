import "./board.css";
import { ITetromino } from "front/types/tetrominoes.type";
import { IBoard, ICell, IGame } from "front/types/board.types";
import { buildBoard } from "front/utils/board.utils";
import {
	getPieceIndex,
	getShape,
	getTetrominoClassName,
	transferPieceToBoard,
} from "front/utils/piece.utils";
import { useMemo } from "react";
import { IGameState } from "front/store/game.slice";
import { useAppSelector } from "front/store/hook";
import PiecePreview from "./piece-preview";
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
	currentPieceIndex: number
	// game: IGameState;
	// pieces: ITetromino[];
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
	currentPieceIndex
	// game,
	// pieces
}: BoardPreviewProps) {
	const boardStyles = {
		gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
		gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
		height: "300px",
		width: "200px",
	};
	const game = useAppSelector((state) => state.game);
	const showNextPieces = game.opponentsGames.length < 5;
	const nextPieces = game.pieces.slice(
		getPieceIndex(currentPieceIndex + 1),
		getPieceIndex(currentPieceIndex + 4)
	)
	// console.info("Game Over = ", isGameOver);
	return (
		<div className="flex flex-row">
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
	);
}