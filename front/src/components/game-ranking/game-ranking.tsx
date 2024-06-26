import { IPlayer } from "front/types/player.type";
import "./game-ranking.css";
import { GiLaurelCrown } from "react-icons/gi";

interface GameRankingProps {
	leaderboard: IPlayer[];
}

export default function GameRanking({ leaderboard }: GameRankingProps) {
	return (
		<div data-testid='game-ranking' className="gameranking-container flex flex-col gap8">
			<h2> Classement </h2>
			<div className="gameranking-wrapper flex flex-col gap8">
				{leaderboard.map((player, index) => {
					return (
						<div
							data-testid="rank-item"
							key={index}
							className="gameranking-item flex flex-row items-center content-between"
						>
							<div className="flex flex-row gap8 items-center">
								<span className="text-position flex">
									{index === 0 ? (
										<GiLaurelCrown
											style={{ color: "yellow" }}
										/>
									) : (
										`#${index + 1}`
									)}
								</span>
								<span> {player.name} </span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
