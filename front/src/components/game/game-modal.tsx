import Leaderboard from 'front/components/leaderboard/leaderboard'
import './game.css'
import { IPlayer } from 'front/types/player.type'
import { GameMode } from 'front/types/packet.types'
import { useNavigate } from 'react-router-dom'
import { ILobby } from 'front/types/lobby.type'
import { sendStartGame } from 'front/store/lobby.slice'
import { useAppDispatch, useAppSelector } from 'front/store/hook'

// const LEADERBOARD: IPlayer[] = [
//     {
//         id: 'qwe',
//         name: 'Test',
//         isLeader: false
//     },
//     {
//         id: 'qwe',
//         name: 'Test2',
//         isLeader: false
//     },
//     {
//         id: 'qwe',
//         name: 'Test3',
//         isLeader: false
//     }
// ]

interface GameModeProps {
    gameMode: GameMode;
    lobby: ILobby;
}

export default function GameModal({gameMode, lobby}: GameModeProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
	const playerConnected = useAppSelector((state) => state.player);
	const lobbyOwner = lobby?.players.find((player) => player.isLeader);
    const isSolo = gameMode === GameMode.SOLO;
    const leaveGame = () => {
        if (isSolo) {
            navigate('/home')
        } else {
            navigate('/lobby')
        }
    }
    return (
        <div className="game-modal-container flex flex-col content-evenly">
            { !isSolo && lobby.leaderboard && <Leaderboard leaderboard={lobby.leaderboard}/>}
            {
                isSolo &&
                <div className='flex flex-col items-center content-center'>
                    <span className='modal-title'> Votre Score </span>
                    <span className='modal-score'> 12354 </span>
                </div>
            }
            <div className='flex flex-row items-center content-center gap8'>
                <button className='button' onClick={leaveGame}> Retour au lobby </button>
                {lobbyOwner && lobbyOwner.id === playerConnected.id && <button className='button' onClick={() => dispatch(sendStartGame({}))}> Rejouer </button>}
                {lobbyOwner && lobbyOwner.id !== playerConnected.id && <span> En attente du leader pour relancer </span>}
            </div>
        </div>
    )
}