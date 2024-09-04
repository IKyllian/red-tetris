import { ILobby } from "front/types/lobby.type";

export const LOBBY_ROUTE = `${import.meta.env.VITE_IP}:3000/api/lobby`
export async function getLobbyList(): Promise<ILobby[]> {
    const response = await fetch(LOBBY_ROUTE, {
        method: "GET"
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
}