import { useState } from "react";
import { useAppDispatch } from "../store/hook";
import { IGame } from "../types/board.types";
import { moveDown, moveToBottom } from "../utils/piece.utils";
import { moveStateDown } from "../store/lobby.slice";

const TICKRATE = 1000 / 30;
export const useTick = (game: IGame, gameIdx: number) => {
    const [tick, setTick] = useState<number>(0)
    const [lastUpdate, setLastUpdate] = useState<number>(performance.now())
    const [gameInterval, setGameInterval] = useState(undefined)
    const [tickToMoveDown, setTickToMoveDown] = useState<number>(0)
	const currentPiece = game.pieces[0]
	console.log("currentPiece = ", currentPiece)
    const dispatch = useAppDispatch()
    const updateState = () => {
		let deltaTime = performance.now() - lastUpdate;
        console.log("updateState CALLED = ", deltaTime)
		while (deltaTime >= TICKRATE) {
			console.log("TICK = ", tick)
			console.log("TESTTTTTTTT = ", tickToMoveDown, " - ", getFramesPerGridCell(game.level))
            if (tickToMoveDown >= getFramesPerGridCell(game.level) && currentPiece) {
				console.log("IN CONDITION")
				dispatch(moveStateDown(gameIdx))
                // moveDown(game);
            } else {
                setTickToMoveDown(state => state + 1)
            }

			deltaTime -= TICKRATE;
            
            setTick(state => state + 1)
		}
		setLastUpdate(performance.now())
        //Emit event
        // dispatch(sendInput())

		// this.gameInterval = setTimeout(this.updateState.bind(this), 1000);
        // window.requestAnimationFrame(updateState);
        setGameInterval(setTimeout(updateState, 1000));
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
        updateState 
    ]
}