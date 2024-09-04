import { useAppDispatch, useAppSelector } from "front/store/hook";
import "./header.css";
import { FaUser } from "react-icons/fa";
import { leaveLobby } from "front/store/lobby.slice";
import { leaveGame, resetGame } from "front/store/game.slice";
const TETRIS = [
	{
		letter: "T",
		color: "#E61214",
	},
	{
		letter: "E",
		color: "#F9440D",
	},
	{
		letter: "T",
		color: "#FE9113",
	},
	{
		letter: "R",
		color: "#228A1C",
	},
	{
		letter: "I",
		color: "#0875CF",
	},
	{
		letter: "S",
		color: "#7E1875",
	},
];

export default function Header() {
	const player = useAppSelector((state) => state.player);
	const lobby = useAppSelector((state) => state.lobby);
	const dispatch = useAppDispatch();
	const handleLeave = () => {
		if (lobby) {
			dispatch(leaveGame());
			dispatch(resetGame());
			dispatch(leaveLobby(lobby.id));
		}
	};
	return (
		<div className="header-container flex flex-row items-center content-between flex-wrap">
			<div className="flex flex-row items-center logo">
				{TETRIS.map((letter, index) => 
					<span
						data-testid="logo-letter"
						key={index}
						className="header-logo-letter"
						style={{ color: letter.color }}
					>
						{letter.letter}
					</span>	
				)}
			</div>
			<div data-testid="header-right-container" className="flex flex-row items-center gap12">
				{lobby?.gameStarted && (
					<button data-testid="leave-button" onClick={handleLeave} className="button">
						Leave
					</button>
				)}
				{player && (
					<div data-testid="player-name" className="flex flex-row items-center gap16 player-name-container">
						<FaUser />
						<span className="player-name"> {player.name} </span>
					</div>
				)}
			</div>
		</div>
	);
}
