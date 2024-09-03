import { IPlayerScore } from "front/types/leaderboard.type";

export const LEADERBOARD_ROUTE = `${import.meta.env.VITE_IP}:3000/api/leaderboard`
export async function getLeaderboard(): Promise<IPlayerScore[]> {
    const response = await fetch(LEADERBOARD_ROUTE, {
        method: "GET"
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
}