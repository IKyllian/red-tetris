import { IGame } from "../../types/board.types";
import { ILobby } from "../../types/lobby.type";
import { Board, PiecePreview, BoardPreview } from "../board/board";

interface GameProps {
	opponentsGames: IGame[];
	playerGame: IGame;
	lobby: ILobby;
	s;
}

export function Game({ opponentsGames, playerGame, lobby }: GameProps) {
	return (
		<div className="boards-container flex flex-row gap8">
			{playerGame && (
				<>
					<Board
						board={playerGame.board}
						game={playerGame}
						seed={lobby.seed}
					/>
					<div className="flex flex-col gap4">
						{playerGame.pieces
							.slice(
								playerGame.currentPieceIndex + 1,
								playerGame.currentPieceIndex + 4
							)
							.map((piece, pieceIndex) => (
								<PiecePreview
									key={pieceIndex}
									tetromino={piece}
								/>
							))}
					</div>
				</>
			)}
			{opponentsGames.map((game, index) => (
				<BoardPreview
					key={index}
					board={game.board}
					playerName={game.player.name}
					isGameOver={game.gameOver}
				/>
			))}
		</div>
	);
}
