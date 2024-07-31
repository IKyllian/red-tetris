import "./board.css";
import { ITetromino } from "front/types/tetrominoes.type";
import { IBoard } from "front/types/board.types";
import { getTetrominoClassName } from "front/utils/piece.utils";
import { useEffect, useMemo, useRef, useState } from "react";
import PiecePreview from "./piece-preview";
import { useAppSelector } from "front/store/hook";
import { GameMode } from "front/types/packet.types";
import { getBoardStyleSize, getPiecePreviewSize } from 'front/utils/board-size-display.utils'
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
	const boardRef = useRef<HTMLDivElement>(null);

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
		if (boardRef.current) {
			boardRef.current.focus();
		}
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const boardStyles = useMemo(() => ({
		gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
		gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
		width: `${boardSize.width}px`,
		height: `${boardSize.height}px`,
		minWidth: "110px",
		minHeight: "190px",
	}), [board.size.rows, board.size.columns, boardSize]);

	return (
		<div className="inline-flex" style={{ position: "relative" }} autoFocus={true}>
			{
				!isOpponentBoards && count > -1 && 
				<div data-testid="countdown" className="countdown-container">
					<span> {count > 0 ? count : "GO"} </span>
				</div>
			}
			{
				isSolo &&
				<div data-testid="score-container" className="score-container flex gap16">
					<span> Score: {score} </span>
					<span> Level: {level} </span>
				</div>
			}
			<div className="flex flex-col">
				<div
					data-testid="board"
					className="board board-border"
					style={boardStyles}
					tabIndex={0}
					ref={boardRef}
				>
					{isGameOver && (
						<span data-testid="gameOver" className="gameOver"> Game Over </span>
					)}
					
					{board.cells.map((row) =>
						row.map((cell, cellIndex) => (
							<div
								data-testid="cell-item"
								key={cellIndex}
								className="cell"
							>
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
					className="playerName"
				>
					{playerName}
				</span>
			</div>
			{!isOpponentBoards && nextPieces.length > 0 && (
				<div data-testid="next-pieces-container" className="board-box-container">
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
