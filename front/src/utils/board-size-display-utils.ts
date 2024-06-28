export const getBoardStyleSize = (
	isOpponentBoards: boolean,
	numberOfOpponents: number
): { width: number, height: number } => {
	const { innerWidth: width, innerHeight: height } = window;
	const size =
		isOpponentBoards && numberOfOpponents > 1
			? {
					widthRatio: 0.1,
					heightRatio: 0.2,
					width: width / 2,
					height: width / 2,
			}
			: {
					widthRatio: 0.3,
					heightRatio: 0.5,
					width,
					height,
			};
	const ret = {
		width: Math.min(
			size.width * size.widthRatio,
			size.height * size.widthRatio
		),
		height: Math.min(
			size.width * size.heightRatio,
			size.height * size.heightRatio
		),
	};
	return ret;
};

export const getPiecePreviewSize = (boardSize: { width: number; height: number }): { width: number, height: number } => {
	return {
		width: boardSize.width * 0.4,
		height: boardSize.height * 0.2,
	};
};