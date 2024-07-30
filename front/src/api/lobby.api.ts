import { IPlayerScore } from "front/types/leaderboard.type";
import { ILobby } from "front/types/lobby.type";

export async function getLobbyList(): Promise<ILobby[]> {
    const response = await fetch("http://localhost:3000/lobby", {
        method: "GET"
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
}