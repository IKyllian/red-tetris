import { IPlayer } from "front/types/player.type"
import './leaderboard.css'
import { GiLaurelCrown } from "react-icons/gi";

interface LeaderboardProps {
    leaderboard: IPlayer[];
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
	return (
		<div className="leaderboard-container flex flex-col gap8">
            <h2> Leaderboard </h2>
			<div className="leaderboard-wrapper flex flex-col gap8">
                {
                    leaderboard.map((player, index) => {
                        return (
                            <div key={index} className="leaderboard-item flex flex-row items-center content-between">
                                <div className="flex flex-row gap8 items-center">
                                    <span className="text-position flex"> {index === 0 ? <GiLaurelCrown style={{color: 'yellow'}} /> : `#${index + 1}`} </span>
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
