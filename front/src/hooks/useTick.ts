import { useEffect, useRef } from "react";
import { useAppDispatch } from "../store/hook";
import { IGame } from "../types/board.types";
import { moveStateDown } from "../store/lobby.slice";
import { getFramesPerGridCell } from "../utils/board.utils";

const TICKRATE = 1000 / 30;
export const useTick = (game: IGame) => {
    const requestRef = useRef<number>();
    const lastUpdateRef = useRef<number | undefined>(undefined);
    const tickRef = useRef<number>(0);
    const tickToMoveDownRef = useRef<number>(0);
	const dispatch = useAppDispatch();
	const currentPiece = game.pieces[0];

	const update = () => {
        if (lastUpdateRef.current === undefined) {
            lastUpdateRef.current = performance.now()
        }
        let deltaTime = performance.now() - lastUpdateRef.current;
        let tickRate = 0;
        while (deltaTime >= TICKRATE) {
            if (tickToMoveDownRef.current >= getFramesPerGridCell(game.level) && currentPiece) {
				dispatch(moveStateDown())
                tickToMoveDownRef.current = 0
            } else {
                tickToMoveDownRef.current = tickToMoveDownRef.current + 1
            }
            tickRate++;
			deltaTime -= TICKRATE;
            tickRef.current = tickRef.current + 1
            lastUpdateRef.current = performance.now()
		}
        requestRef.current = setTimeout(update, 1000);
    }

	useEffect(() => {
        requestRef.current = setTimeout(update, 1000);
        return () => clearTimeout(requestRef.current);
    }, [])

	return {
		tick: tickRef.current
	}
}