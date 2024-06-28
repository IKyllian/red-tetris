import "./board.css";
import { ITetromino } from "front/types/tetrominoes.type";
import { IBoard } from "front/types/board.types";
import { getTetrominoClassName } from "front/utils/piece.utils";
import { useEffect, useState } from "react";
import PiecePreview from "./piece-preview";
import { useAppSelector } from "front/store/hook";
import { GameMode } from "front/types/packet.types";
import { getBoardStyleSize, getPiecePreviewSize } from 'front/utils/board-size-display-utils'
interface BoardProps {
	board: IBoard;
	playerName: string;
	isGameOver: boolean;
	nextPieces: Array<ITetromino>;
	isOpponentBoards: boolean;
	opponentsLength?: number;
	gameMode: GameMode
}

const Board = ({
	board,
	playerName,
	isGameOver,
	nextPieces,
	isOpponentBoards,
	opponentsLength = 0,
	gameMode
}: BoardProps) => {
	const [boardSize, setBoardSize] = useState(
		getBoardStyleSize(isOpponentBoards, opponentsLength)
	);
	const [piecePreviewSize, setPiecePreviewSize] = useState(
		getPiecePreviewSize(boardSize)
	);
	const isSolo = gameMode === GameMode.SOLO;
	const score = useAppSelector((state) => state.game.playerGame.score);
	const level = useAppSelector((state) => state.game.playerGame.level);
	const count = useAppSelector((state) => state.game.countdown);

	useEffect(() => {
		const handleResize = () => {
			const newSize = getBoardStyleSize(
				isOpponentBoards,
				opponentsLength
			);
			setBoardSize(newSize);
			setPiecePreviewSize(getPiecePreviewSize(newSize));
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const boardStyles = {
		gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
		gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
		width: `${boardSize.width}px`,
		height: `${boardSize.height}px`,
		minWidth: "73px",
		minHeight: "156px",
	};

	return (
		<div className="inline-flex" style={{ position: "relative" }}>
			{
				!isOpponentBoards && 
				<div className="countdown-container">
					{count > -1 && <span> {count > 0 ? count : "GO"} </span>}
				</div>
			}
			{
				isSolo &&
				<div className="score-container flex gap16">
					<span> Score: {score} </span>
					<span> Level: {level} </span>
				</div>
			}
			<div className="flex flex-col">
				<div
					className="board board-border"
					style={boardStyles}
					tabIndex={0}
				>
					{isGameOver && (
						<span className="gameOver"> Game Over </span>
					)}
					
					{board.cells.map((row) =>
						row.map((cell, cellIndex) => (
							<div key={cellIndex} className="cell">
								<div
									className={getTetrominoClassName(
										cell.type,
										cell.isPreview
									)}
								></div>
							</div>
						))
					)}
				</div>
				<span
					style={{
						fontSize: "1em",
						color: "red",
						textAlign: "center",
					}}
				>
					{playerName}
				</span>
			</div>
			{!isOpponentBoards && nextPieces.length > 0
				// || (isOpponentBoards &&
				// 	nextPieces.length > 0 &&
				// 	opponentsLength <= 4))
				&& (
				<div className="board-box-container">
					<div className="box-title"> NEXT </div>
					<div className="flex flex-col box-border">
						{nextPieces.map((piece, index) => (
							<PiecePreview
								key={index}
								tetromino={piece}
								piecePreviewSize={piecePreviewSize}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default Board;
