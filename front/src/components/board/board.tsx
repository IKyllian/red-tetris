import "./board.css";
import { ITetromino } from "front/types/tetrominoes.type";
import { IBoard } from "front/types/board.types";
import {
	getTetrominoClassName,
} from "front/utils/piece.utils";
import { useEffect, useMemo, useState } from "react";
import PiecePreview from "./piece-preview";
interface BoardProps {
	board: IBoard;
	playerName: string;
	isGameOver: boolean;
	nextPieces: Array<ITetromino>;
	piecePreviewWidth?: string;
	piecePreviewHeight?: string;
	isOpponentBoards: boolean
}

const Cell = ({ cellClassname }) => {
	return (
		<div className="cell">
			<div className={cellClassname}></div>
		</div>
	);
};

const getBoardSize = (isOpponentBoards: boolean) => {
	const { innerWidth: width, innerHeight: height } = window;
	const size = isOpponentBoards ? {
		widthRatio: 0.1,
        heightRatio: 0.2,
		width: (width / 2),
		height: (width / 2)
	} : {
		widthRatio: 0.3,
        heightRatio: 0.5,
		width,
		height
	}
	const ret = {
	  width: Math.min(size.width * size.widthRatio, size.height * size.widthRatio),
	  height: Math.min(size.width * size.heightRatio, size.height * size.heightRatio)
	};
	return ret;
};

const Board = ({
	board,
	playerName,
	isGameOver,
	nextPieces,
	// width = 'calc((100vw * 0.8)',
	isOpponentBoards,
	piecePreviewWidth = '170px',
	piecePreviewHeight = '170px'
}: BoardProps) => {
	// const boardStyles = useMemo(
	// 	() => ({
	// 		gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
	// 		gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
	// 		width,
	// 		height
	// 	}),
	// 	[board.size]
	// );
	const [boardSize, setBoardSize] = useState(getBoardSize(isOpponentBoards));
	  useEffect(() => {
		const handleResize = () => {
		  setBoardSize(getBoardSize(isOpponentBoards));
		};
	
		window.addEventListener('resize', handleResize);
		return () => {
		  window.removeEventListener('resize', handleResize);
		};
	}, []);

	const boardStyles = {
		gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
		gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`,
		width: boardSize.width,
		height: boardSize.height,
	}

	return (
		<div className="inline-flex">
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
							<PiecePreview
								key={index}
								tetromino={piece}
								piecePreviewWidth={piecePreviewWidth}
								piecePreviewHeight={piecePreviewHeight}
							/>
						))
					}
				</div>
			</div>
		</div>
	);
};

export default Board