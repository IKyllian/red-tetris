import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { createLobby } from "../../store/lobby.slice";

export function Home() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch()
    const playerName = useAppSelector((state) => state.player.name);
    const handleCreateLobby = () => {
        dispatch(createLobby({
            name: "Lobby Test",
            playerName: playerName
            
        }));
        navigate('/lobby');
    }
    return (
        <div className="home-container flex content-center items-center">
            <div className="buttons-container flex flex-row gap8">
                <button type="button" onClick={handleCreateLobby}> Create Game </button>
                <button type="button"> Join Game </button>
            </div>
        </div>
    );
}