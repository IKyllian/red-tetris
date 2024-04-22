import { IGame } from "../../types/board.types";
import { Board, BoardPreview } from "../board/board";

interface GameProps {
    games: IGame[];
}
export function Game({ games }: GameProps) {
    return (
        <div className="boards-container flex flex-row gap8">
            {
                games.map((game, index) => (
                    <>
                        <Board key={index} board={game.board} />
                        {
                            game.pieces.slice(1).map((piece, pieceIndex) => (
                                <BoardPreview key={pieceIndex} tetromino={piece}  />
                            ))
                        }
                    </>
                    
                ))
            }
        </div>
    )
}