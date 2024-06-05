import { IPlayer } from "front/types/player.type"
import './leaderboard.css'
import { GiLaurelCrown } from "react-icons/gi";

interface LeaderboardProps {
    leaderboard: IPlayer[];
}

export function Leaderboard({ leaderboard }: LeaderboardProps) {
	return (
		<div className="leaderboard-container flex flex-col gap8">
            <h2> Last game leaderboard </h2>
			<div className="leaderboard-wrapper flex flex-col gap8">
                {
                    leaderboard.map((player, index) => {
                        return (
                            <div key={index} className="leaderboard-item flex flex-row items-center content-between">
                                <div className="flex flex-row gap8 items-center">
                                    <span> {index === 0 ? <GiLaurelCrown style={{color: 'yellow'}} /> : `#${index + 1}`} </span>
                                    <span> {player.name} </span>
                                </div>
                               
                                <span> 1245 </span>
                            </div>
                        )
                    })
                }
            </div>

		</div>
	)


}
