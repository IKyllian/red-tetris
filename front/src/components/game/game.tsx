import { useAppSelector } from "../../store/hook";
import { IGame } from "../../types/board.types";
import { Board, PiecePreview, BoardPreview } from "../board/board";

interface GameProps {
    games: IGame[];
}

export function Game({ games }: GameProps) {
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
                        playerGame.pieces.slice(1).map((piece, pieceIndex) => (
                            <PiecePreview key={pieceIndex} tetromino={piece}   />
                        ))}
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