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
            <input autoComplete="off" className='input' type="text" placeholder="Name" {...register("lobbyName", {required: true})} />
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
            <input autoComplete="off" className='input' type="text" placeholder="Game Id" {...register("lobbyId", {required: true})} />
            {errors.lobbyId && errors.lobbyId.message && <p className="error-message"> {errors.lobbyId.message} </p>}
            <button className='button' type="submit">Join game</button>
        </form>
    )
}

const GAME_MODE = [
    {
        title: "solo",
        description: "Jouez solo et faites le meilleur score possible",
        color: '#34222d',
        textColor: '#f1bcdb'
    },
    {
        title: "multijoueur",
        description: "Creez ou rejoignez un lobby pour jouer en multijoueur",
        color: "#1e1d2d",
        textColor: '#bab8df'
    },
    {
        title: "liste des lobby",
        description: "Liste de tous les lobby",
        color: '#1c263e',
        textColor: '#88afff',
        path: '/room-list'
    }
]

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

    const navigateTo = (path?: string) => {
        if (path) navigate(path)
    }
    return (
        <div className="home-container">
            <div className='game-mode-list flex flex-col gap12'>
                {
                    GAME_MODE.map((gameMode, index) => {
                        if (index === 1) { //TODO Surement a modifier plus tard
                            return (
                                <div key={index} className='game-mode-item flex flex-row content-evenly' style={{backgroundColor: '#1e1d2d', color: '#bab8df'}}>
                                    <div className='flex flex-col'>
                                        <span className='game-mode-title'> Creer un lobby </span>
                                        <CreateGameButton playerName={playerName} />
                                    </div>

                                    <div className='flex flex-col'>
                                        <span className='game-mode-title'> Rejoindre un lobby </span>
                                        <JoinGameButton playerName={playerName} />
                                    </div>                    
                                </div>
                            )
                        } else {
                            return (
                                <div onClick={() => navigateTo(gameMode.path)} key={index} className='game-mode-item flex flex-col' style={{backgroundColor: gameMode.color, color: gameMode.textColor}}>
                                    <span className='game-mode-title'> {gameMode.title} </span>
                                    <span className='game-mode-description'> {gameMode.description} </span>
                                </div>
                            )
                        }
                    })
                }
                
            </div>
        </div>
    );
}