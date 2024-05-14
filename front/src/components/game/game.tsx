import { useAppSelector } from "../../store/hook";
import { IGame } from "../../types/board.types";
import { ILobby } from "../../types/lobby.type";
import { Board, PiecePreview, BoardPreview } from "../board/board";

interface GameProps {
    games: IGame[];
    lobby: ILobby;
}

export function Game({ games, lobby }: GameProps) {
    const playerName = useAppSelector((state) => state.player.name);
    const playerGame = games.find((game) => game.player.name === playerName);
    const opponentsGame = games.filter((game) => game.player.name !== playerName);
    return (
        <div className="boards-container flex flex-row gap8">
            {
                playerGame && 
                <>
                    <Board
                        board={playerGame.board}
                        gameIdx={games.findIndex((game) => game.player.name === playerName)}
                        isGameOver={playerGame.gameOver}
                        game={playerGame}
                    />
                    {
                        lobby.pieces.slice(1, 4).map((piece, pieceIndex) => (
                            <PiecePreview key={pieceIndex} tetromino={piece}   />
                        ))
                    }
                </>
            }
            {
                opponentsGame.map((game, index) => (
                    <BoardPreview key={index} board={game.board} playerName={game.player.name} isGameOver={game.gameOver} />
                ))
            }
        </div>
    )
}