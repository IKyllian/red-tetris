import { IPlayerScore } from "front/types/leaderboard.type";

export const LEADERBOARD_ROUTE = `${process.env.VITE_IP_URL}:3000/api/leaderboard`
export async function getLeaderboard(): Promise<IPlayerScore[]> {
    const response = await fetch(LEADERBOARD_ROUTE, {
        method: "GET"
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
}