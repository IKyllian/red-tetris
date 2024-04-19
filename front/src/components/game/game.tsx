import { defaultBoardSize } from "../../types/board.types";
import { Board } from "../board/board";

export function Game() {
    return (
        <div>
            <Board size={defaultBoardSize} />

        </div>
    )
}