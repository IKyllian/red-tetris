import { useAppSelector } from "../../store/hook";
import { IGame } from "../../types/board.types";
import { Board, BoardPreview } from "../board/board";

interface GameProps {
    games: IGame[];
}
export function Game({ games }: GameProps) {
    const playerName = useAppSelector((state) => state.player.name);
    return (
        <div className="boards-container flex flex-row gap8">
            {
                games.map((game, index) => (
                    <>
                        <Board key={index} board={game.board} playerBoard={game.player} gameIdx={index}/>
                        {
                            game.player.name === playerName &&
                            game.pieces.slice(1).map((piece, pieceIndex) => (
                                <BoardPreview key={pieceIndex} tetromino={piece}  />
                            ))
                        }
                        {/* {
                            game.pieces.slice(1).map((piece, pieceIndex) => (
                                <BoardPreview key={pieceIndex} tetromino={piece}  />
                            ))
                        } */}
                    </>
                    
                ))
            }
        </div>
    )
}