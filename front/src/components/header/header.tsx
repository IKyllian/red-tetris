import { useAppSelector } from "front/store/hook"
import './header.css'

const TETRIS = [
    {
        letter: 'T',
        color: '#E61214'
    },
    {
        letter: 'E',
        color: '#F9440D'
    },
    {
        letter: 'T',
        color: '#FE9113'
    },
    {
        letter: 'R',
        color: '#228A1C'
    },
    {
        letter: 'I',
        color: '#0875CF'
    },
    {
        letter: 'S',
        color: '#7E1875'
    },
]

export default function Header() {
    const player = useAppSelector(state => state.player)
    const lobby = useAppSelector(state => state.lobby)
    return (
        <div className="header-container flex flex-row items-center content-between">
            <div className="flex flex-row items-center">
                {
                    TETRIS.map((letter, index) => {
                        return (
                            <span key={index} className="header-logo" style={{ color: letter.color }}> {letter.letter} </span>
                        )
                    })
                }
            </div>
            {/* <span className="header-logo"> tetris</span> */}
            <div className="flex flex-row items-center gap12">
                {
                    lobby?.gameStarted &&
                    <button className="button"> Leave </button>
                }
                {/* {
                    !lobby.gameStarted &&
                    <button className="button"> rooms list </button>
                }    */}
                { player && <span className="player-name"> {player.name} </span> }
            </div>
        </div>
    )
}