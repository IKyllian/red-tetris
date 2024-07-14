import { useAppDispatch } from "front/store/hook"
import { useEffect, useRef } from "react";
import { updatePlayerGame } from 'front/store/game.slice';

export const useGameLoop = (gameOver: boolean) => {
    const dispatch = useAppDispatch();

    const fpsRef = useRef<number>(0);
    const timer = useRef<number>(0)
    const gameFrame = useRef<number>()
    const lastUpdateTime = useRef<number>(performance.now())
    const lastFpsUpdate = useRef<number>(performance.now())
    const frameCount = useRef<number>(0)


    useEffect(() => {
        const calculateFPS = (currentTime: number) => {
            const deltaTime = currentTime - lastFpsUpdate.current;
            frameCount.current++;
            if (deltaTime > 1000) {
                fpsRef.current = frameCount.current / (deltaTime / 1000);
                frameCount.current = 0;
                lastFpsUpdate.current = currentTime;
            }
        };
    
        const update = (currentTime: number) => {
            const deltaTime = currentTime - lastUpdateTime.current;
            timer.current += deltaTime;
            calculateFPS(currentTime);
            lastUpdateTime.current = currentTime;
            dispatch(updatePlayerGame(deltaTime));
            gameFrame.current = requestAnimationFrame(update);
        };

        if (!gameOver) {
            gameFrame.current = requestAnimationFrame(update);
          }
      
          return () => {
            console.log('cleanup');
            if (gameFrame.current) {
              cancelAnimationFrame(gameFrame.current);
            }
          };
    }, [dispatch, gameOver])
    
    return fpsRef.current;
}