import { useAppDispatch, useAppSelector } from "../../store/hook"
import { ILobby } from "../../types/lobby.type";
import { startGame } from "../../store/lobby.slice";
import { Game } from "../game/game";

export function Lobby() {
    const lobby: ILobby = useAppSelector(state => state.lobby);
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(startGame());
    }

    if (!lobby.gameStarted) {
        return (
            <div>
                <h2> Lobby </h2>
                <div>
                    <p> Player List : </p>
                    <ul>
                        {
                            lobby.players.map((player, index) => {
                                return <li key={index}>{player.name}</li>
                            })
                        }
                    </ul>
                </div>
                <div>
                    <button type="button" onClick={handleClick}> Start Game </button>
                </div>
            </div>
        )
    } else {
        return (
            <Game games={lobby.games} />
        )
    }
}