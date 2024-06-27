import "./board.css";
import { ITetromino } from "front/types/tetrominoes.type";
import { ICell } from "front/types/board.types";
import { buildBoard } from "front/utils/board.utils";
import {
	getShape,
	getTetrominoClassName,
	transferPieceToBoard,
} from "front/utils/piece.utils";

interface PiecePreviewProps {
	piecePreviewSize: {width: number, height: number}
	tetromino: ITetromino
}

export default function PiecePreview({ tetromino, piecePreviewSize }: PiecePreviewProps) {
	const board = buildBoard({ rows: 4, columns: 4 });
	const boardStyles = {
		gridTemplateRows: `repeat(4, 1fr)`,
		gridTemplateColumns: `repeat(4, 1fr)`,
		height: `${piecePreviewSize.height}px`,
		width: `${piecePreviewSize.width}px`,
	};

	const shape = getShape(tetromino.type, tetromino.rotationState);
	const rows = transferPieceToBoard(
		board,
		{ ...tetromino, position: { x: 0, y: 0 } },
		shape,
		false
	);
	return (
		<div data-testid='board' className="board" style={boardStyles}>
			{rows.map((row) =>
				row.map((cell: ICell, cellIndex: number) => (
					<div data-testid='cell-preview' key={cellIndex} className="cell-piece-preview">
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
