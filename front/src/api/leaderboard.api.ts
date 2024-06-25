import { IPlayerScore } from "front/types/leaderboard.type";

export async function getLeaderboard(): Promise<IPlayerScore[]> {
    const response = await fetch("http://localhost:3000/leaderboard", {
        method: "GET"
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
}