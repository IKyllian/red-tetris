import { IGame } from "../../types/board.types";
import { ILobby } from "../../types/lobby.type";
import { Board, PiecePreview, BoardPreview } from "../board/board";

interface GameProps {
    opponentsGames: IGame[];
    playerGame: IGame;
    lobby: ILobby;
}

export function Game({ opponentsGames, playerGame, lobby }: GameProps) {
    return (
        <div className="boards-container flex flex-row gap8">
            {
                playerGame &&
                <>
                    <Board
                        board={playerGame.board}
                        game={playerGame}
                    />
                    <div  className="flex flex-col gap4">
                        {
                            lobby.pieces.slice(1, 4).map((piece, pieceIndex) => (
                                <PiecePreview key={pieceIndex} tetromino={piece}  />
                            ))
                        }
                    </div>
                </>
            }
            {
                opponentsGames.map((game, index) => (
                    <BoardPreview key={index} board={game.board} playerName={game.player.name} isGameOver={game.gameOver} />
                ))
            }
        </div>
    )
}