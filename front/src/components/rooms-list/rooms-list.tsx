import { useAppDispatch } from 'front/store/hook';
import './rooms-list.css'
import { FaUsers } from "react-icons/fa";

const lobbys = [
    {
        name: "Rooms 1",
        players: 5,
        inGame: false,
        leader: "User 1"
    },
    {
        name: "Rooms 2",
        players: 5,
        inGame: true,
        leader: "User 1"
    },
    {
        name: "Rooms 3",
        players: 5,
        inGame: true,
        leader: "User 1"
    }
]

export function RoomsList() {
    // const dispatch = useAppDispatch();
    // const joinLobby = () => {
    //     dispatch(joinLobby({
    //         lobbyId: data.lobbyId,
    //         playerName: playerName
    //     }));
    //     // navigate('/lobby');
    // }
    return (
        <div className="page-wrapper flex flex-col content-center items-center">
            <h2> Room List </h2>
            <div className="rooms-list-container flex flex-col gap8">
                {
                    lobbys.map((lobby, index) => {
                        return (
                            <div key={index} className="room-list-item flex flex-row content-between items-center">
                                <div className='flex flex-col'>
                                    <span className='lobby-name'>{lobby.name}</span>
                                    <span className='lobby-info'>{lobby.inGame ? 'ingame' : 'lobby'} - {lobby.leader}</span>
                                </div>
                                <div className='flex flex-row gap4 items-center'>
                                    <span className='lobby-name'>{lobby.players}</span>
                                    <FaUsers />
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
        
    )
}