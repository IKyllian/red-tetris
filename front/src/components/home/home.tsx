import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { createLobby, joinLobby } from "../../store/lobby.slice";
import { useForm } from 'react-hook-form';

interface FormValues {
    lobbyId: string;
}

export function Home() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const playerName = useAppSelector((state) => state.player.name);
    const handleCreateLobby = () => {
        dispatch(createLobby({
            name: "Lobby Test",
            playerName: playerName
        }));
        navigate('/lobby');
    }

    const onSubmit = (data: FormValues): void => {
        dispatch(joinLobby({
            playerName: playerName,
            lobbyId: data.lobbyId
        }));
        navigate('/lobby');
    }
    return (
        <div className="home-container flex content-center items-center">
            <div className="buttons-container flex flex-row gap8">
                <button type="button" onClick={handleCreateLobby}> Create Game </button>
                <form onSubmit={handleSubmit(onSubmit)} className="">
                    <input type="text" placeholder="Name" {...register("lobbyId", {required: true})} />
                    {errors.lobbyId && errors.lobbyId.message && <p className="error-message"> {errors.lobbyId.message} </p>}
                    <button type="submit">Join game</button>
                </form>
            </div>
        </div>
    );
}