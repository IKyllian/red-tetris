import { useEffect, useRef } from "react"

// Build  useInterval hook -> https://www.30secondsofcode.org/react/s/use-interval-explained/
export const useInterval = (callback: () => void, delay: number) => {
    const savedCallback = useRef<() => void>();

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => {
                clearInterval(id);
            };
        }
    }, [delay]);
}