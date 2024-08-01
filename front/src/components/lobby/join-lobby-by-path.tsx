import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { sign } from "front/store/player.slice";
import { useEffect } from "react";
import { joinLobby } from "front/store/lobby.slice";

export default function JoinLobbyByPath() {
	const params = useParams();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { isSocketConnected } = useAppSelector(state => state.socket)

	useEffect(() => {
		const { lobbyId, playerName } = params;
		if (isSocketConnected) {
			if (isSocketConnected && lobbyId && playerName) {
				dispatch(sign(playerName));
				dispatch(
					joinLobby({
						lobbyId,
						playerName,
					})
				);
				navigate("/lobby");
			} else {
				navigate('/')
			}
		}
	}, [isSocketConnected]);

	return <> </>;
}
