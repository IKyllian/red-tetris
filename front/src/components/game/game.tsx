import { IGame } from "../../types/board.types";
import { Board } from "../board/board";

interface GameProps {
    games: IGame[];
}
export function Game({ games }: GameProps) {
    return (
        <div>
            {
                games.map((game, index) => (
                    <Board key={index} board={game.board} />
                ))
            }
        </div>
    )
}