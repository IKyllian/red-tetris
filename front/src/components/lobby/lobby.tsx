import { useState } from "react"
import { IPlayer } from "../../types/player.type"
import { useAppSelector } from "../../store/hook"
import { useNavigate } from 'react-router-dom';

export function Lobby() {
    const playerName = {name: useAppSelector(state => state.player.name), id: "", isLeader: false};
    const [players, _] = useState<IPlayer[]>([playerName])
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/game');
    }

    return (
        <div>
            <h2> Lobby </h2>
            <div>
                <p> Player List : </p>
                <ul>
                    {
                        players.map((player, index) => {
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
}