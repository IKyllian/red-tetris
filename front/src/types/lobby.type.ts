import { IGame } from "./board.types";
import { IPlayer } from "./player.type";
import { ITetromino } from "./tetrominoes.type";

export interface ILobby {
    name: string,
    id: string,
    players: IPlayer[],
    games: IGame[],
    pieces: ITetromino[]
}

export const defaultLobby: ILobby = {
    name: "",
    id: "",
    players: [],
    games: [],
    pieces: []
}