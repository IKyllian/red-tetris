import { IPlayerScore } from "front/types/leaderboard.type";
import { useEffect, useState } from "react";
import "./leaderboard.css";

export default function Leaderboard() {
	const [leaderboard, setLeaderboard] = useState<IPlayerScore[]>([]);

	useEffect(() => {
		fetch("http://localhost:3000/leaderboard", { method: "GET" })
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => setLeaderboard(data))
			.catch((error) => console.error(error));
	}, []);

	return (
		<div className="leaderboard-container flex flex-col gap8">
			<h2>Leaderboard</h2>
			<div className="leaderboard-wrapper flex flex-col gap8">
				{leaderboard.map((player, index) => {
					return (
						<div
							key={index}
							className="leaderboard-item flex flex-row items-center justify-between"
						>
							<div className="flex flex-row gap8 items-center">
								<span className="text-position flex">
									{index === 0 ? "👑" : `#${index + 1}`}
								</span>
								<span>{player.playerName}</span>
							</div>
							<span>{player.score}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
