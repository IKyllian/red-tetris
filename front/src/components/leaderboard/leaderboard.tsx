import { IPlayerScore } from "front/types/leaderboard.type";
import { useEffect, useState } from "react";
import "./leaderboard.css";
import { getLeaderboard } from "front/api/leaderboard.api";

export default function Leaderboard() {
	const [leaderboard, setLeaderboard] = useState<IPlayerScore[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const data = await getLeaderboard();
            setLeaderboard(data);
		}
		fetchData()
	}, []);

	return (
		<div className="leaderboard-container flex flex-col gap8">
			<h2>Leaderboard</h2>
			<div className="leaderboard-wrapper flex flex-col gap8">
				{leaderboard.length > 0 && leaderboard.map((player, index) => (
					<div
						key={index}
						data-testid="player-list-item"
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
				))}
				{
					!leaderboard.length &&
					<div data-testid="no-player-item" className="text-center">
                        <span>No players yet</span>
                    </div>
				}
			</div>
		</div>
	);
}
