import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { createLobby, joinLobby } from "../../store/lobby.slice";
import { useForm } from 'react-hook-form';

interface JoinFormValues {
    lobbyId: string;
}

interface CreateFormValues {
    lobbyName: string;
}

export function CreateGameButton({ playerName }: {playerName: string}) {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateFormValues>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleCreateLobby = (data: CreateFormValues, e) => {
        e?.preventDefault();
        dispatch(createLobby({
            name: data.lobbyName,
            playerName: playerName
        }));
        navigate('/lobby');
    }

    return (
        <form onSubmit={handleSubmit(handleCreateLobby)} className="">
            <input type="text" placeholder="Name" {...register("lobbyName", {required: true})} />
            {errors.lobbyName && errors.lobbyName.message && <p className="error-message"> {errors.lobbyName.message} </p>}
            <button type="submit">Create game</button>
        </form>
    )
}

export function JoinGameButton({ playerName }: {playerName: string}) {
    const { register, handleSubmit, formState: { errors } } = useForm<JoinFormValues>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleJoinLobby = (data: JoinFormValues) => {
        dispatch(joinLobby({
            lobbyId: data.lobbyId,
            playerName: playerName
        }));
        navigate('/lobby');
    }

    return (
        <form onSubmit={handleSubmit(handleJoinLobby)} className="">
            <input type="text" placeholder="Game Id" {...register("lobbyId", {required: true})} />
            {errors.lobbyId && errors.lobbyId.message && <p className="error-message"> {errors.lobbyId.message} </p>}
            <button type="submit">Join game</button>
        </form>
    )
}

export function Home() {
    const playerName = useAppSelector((state) => state.player.name);

    return (
        <div className="home-container flex content-center items-center">
            <div className="buttons-container flex flex-row gap8">
                {/* A refactor les composants correctement plus tard */}
                <CreateGameButton playerName={playerName} />
                <JoinGameButton playerName={playerName} />
            </div>
        </div>
    );
}