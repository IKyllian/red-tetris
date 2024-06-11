import "./board.css";
import { ITetromino } from "front/types/tetrominoes.type";
import { IBoard } from "front/types/board.types";
import {
	getTetrominoClassName,
} from "front/utils/piece.utils";
import { useMemo } from "react";
import PiecePreview from "./piece-preview";
interface BoardProps {
	board: IBoard;
	playerName: string;
	isGameOver: boolean;
	currentPiece: ITetromino;
	nextPieces: Array<ITetromino>;
}

const Cell = ({ cellClassname }) => {
	return (
		<div className="cell">
			<div className={cellClassname}></div>
		</div>
	);
};

const Board = ({ board, playerName, isGameOver, nextPieces }: BoardProps) => {
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

export default Board