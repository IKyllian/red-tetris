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
                playerGame && !playerGame.board.gameOver &&
                <>
                    <Board
                        board={playerGame.board}
                        // gameIdx={games.findIndex((game) => game.player.name === playerName)}
                        isGameOver={playerGame.gameOver}
                        game={playerGame}
                    />
                    {
                        lobby.pieces.slice(1, 4).map((piece, pieceIndex) => (
                            <PiecePreview key={pieceIndex} tetromino={piece}  />
                        ))
                    }
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