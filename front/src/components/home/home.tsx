import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'front/store/hook';
import { createLobby, joinLobby } from "front/store/lobby.slice";
import { useForm } from 'react-hook-form';
import './home.css'
import { useEffect } from 'react';
interface JoinFormValues {
    lobbyId: string;
}

interface CreateFormValues {
    lobbyName: string;
}

export function CreateGameButton({ playerName }: {playerName: string}) {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateFormValues>();
    // const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleCreateLobby = (data: CreateFormValues, e) => {
        e?.preventDefault();
        dispatch(createLobby({
            name: data.lobbyName,
            playerName: playerName
        }));
        // navigate('/lobby');
    }

    return (
        <form onSubmit={handleSubmit(handleCreateLobby)} className="home-form">
            <input className='input' type="text" placeholder="Name" {...register("lobbyName", {required: true})} />
            {errors.lobbyName && errors.lobbyName.message && <p className="error-message"> {errors.lobbyName.message} </p>}
            <button className='button' type="submit">Create game</button>
        </form>
    )
}

export function JoinGameButton({ playerName }: {playerName: string}) {
    const { register, handleSubmit, formState: { errors } } = useForm<JoinFormValues>();
    // const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleJoinLobby = (data: JoinFormValues) => {
        dispatch(joinLobby({
            lobbyId: data.lobbyId,
            playerName: playerName
        }));
        // navigate('/lobby');
    }

    return (
        <form onSubmit={handleSubmit(handleJoinLobby)} className="home-form">
            <input className='input' type="text" placeholder="Game Id" {...register("lobbyId", {required: true})} />
            {errors.lobbyId && errors.lobbyId.message && <p className="error-message"> {errors.lobbyId.message} </p>}
            <button className='button' type="submit">Join game</button>
        </form>
    )
}

export function Home() {
    const player = useAppSelector((state) => state.player);
    console.log(player)
    const playerName = useAppSelector((state) => state.player.name);
    console.log(playerName)
    const lobby = useAppSelector(state => state.lobby);
    const navigate = useNavigate()
    useEffect(() => {
        if (lobby.id || lobby.id !== '') {
            navigate('/lobby')
        }
    }, [lobby])
    return (
        <div className="home-container flex content-center items-center">
            <div className="buttons-container flex flex-row gap8">
                <div className='card-container flex flex-col gap12 content-evenly'>
                    <span className='title'> Create game</span>
                    <CreateGameButton playerName={playerName} />
                </div>
                <div className='card-container  flex flex-col gap12 content-evenly'>
                    <span className='title'> Join lobby</span>
                    <JoinGameButton playerName={playerName} />
                </div>
            </div>
        </div>
    );
}