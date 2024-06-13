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
	piecePreviewWidth: string;
	piecePreviewHeight: string;
	tetromino: ITetromino
}

export default function PiecePreview({ tetromino, piecePreviewHeight, piecePreviewWidth }: PiecePreviewProps) {
	const board = buildBoard({ rows: 4, columns: 4 });
	const boardStyles = {
		gridTemplateRows: `repeat(4, 1fr)`,
		gridTemplateColumns: `repeat(4, 1fr)`,
		height: piecePreviewHeight,
		width: piecePreviewWidth,
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
