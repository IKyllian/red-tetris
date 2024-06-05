import { useAppSelector } from "front/store/hook"
import './header.css'
export function Header() {
    const player = useAppSelector(state => state.player)
    const lobby = useAppSelector(state => state.lobby)
    return (
        <div className="header-container flex flex-row items-center content-between">
            <span className="header-logo"> tetris</span>
            <div className="flex flex-row items-center gap12">
                {
                    lobby.gameStarted &&
                    <button className="button"> Leave </button>
                }
                {/* {
                    !lobby.gameStarted &&
                    <button className="button"> rooms list </button>
                }    */}
                <span className="player-name"> {player.name} </span>
            </div>
        </div>
    )
}