import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hook";
import { IGame } from "../types/board.types";
import { moveDown, moveToBottom } from "../utils/piece.utils";
import { moveStateDown } from "../store/lobby.slice";
import { setGameInterval, setLastUpdate, setTick, setTickToMoveDown } from "../store/tick.slice";

const TICKRATE = 1000 / 30;
export const useTick = (game: IGame, gameIdx: number) => {
    // const [tick, setTick] = useState<number>(0)
	const [gameInterval, setGameInterval] = useState(undefined)
    // const [lastUpdate, setLastUpdate] = useState<number>(performance.now())
    // const [gameInterval, setGameInterval] = useState(undefined)
    // const [tickToMoveDown, setTickToMoveDown] = useState<number>(0)
	const { tick, tickToMoveDown, lastUpdate } = useAppSelector(state => state.tick)
	const currentPiece = game.pieces[0]
	console.log("currentPiece = ", currentPiece)
    const dispatch = useAppDispatch()
    const updateState = () => {
		console.log("lastUpdate = ", lastUpdate)
		const lastUpdateValue = lastUpdate === undefined ? performance.now() : lastUpdate
		let deltaTime = performance.now() - lastUpdateValue;
        console.log("updateState CALLED = ", deltaTime)
		while (deltaTime >= TICKRATE) {
			console.log("TICK = ", tick)
			console.log("TESTTTTTTTT = ", tickToMoveDown, " - ", getFramesPerGridCell(game.level))
            if (tickToMoveDown >= getFramesPerGridCell(game.level) && currentPiece) {
				console.log("IN CONDITION")
				dispatch(moveStateDown({gameIdx}))
                // moveDown(game);
            } else {
                dispatch(setTickToMoveDown())
            }

			deltaTime -= TICKRATE;
            
            dispatch(setTick())
		}
		dispatch(setLastUpdate(performance.now()))
        //Emit event
        // dispatch(sendInput())

		// this.gameInterval = setTimeout(this.updateState.bind(this), 1000);
        // window.requestAnimationFrame(updateState);
		setGameInterval(setTimeout(updateState, 1000))
		
        // dispatch(setGameInterval(setTimeout(updateState, 1000)));
	}

    const getFramesPerGridCell = (level: number): number => {
		let framesPerGridCell = 0;
		if (level <= 9) {
			framesPerGridCell = 48 - level * 5;
		} else if (level <= 12) {
			framesPerGridCell = 5;
		} else if (level <= 15) {
			framesPerGridCell = 4;
		} else if (level <= 18) {
			framesPerGridCell = 3;
		} else if (level <= 28) {
			framesPerGridCell = 2;
		} else {
			framesPerGridCell = 1;
		}
		// framesPerGridCell / 2 because of tick rate
		return framesPerGridCell / 2;
	}

    return [
        updateState,
		gameInterval
    ]
}