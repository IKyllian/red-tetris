import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { sign } from "front/store/player.slice";
import { useEffect } from "react";
import { joinLobby } from "front/store/lobby.slice";

export default function JoinLobbyByPath() {
	const { lobbyId, playerName } = useParams();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { isSocketConnected } = useAppSelector(state => state.socket)
	const lobby = useAppSelector(state => state.lobby)

	useEffect(() => {
		if (isSocketConnected) {
			if (lobby) {
				navigate("/lobby");
			} else if (lobbyId && playerName) {
				dispatch(sign(playerName));
				dispatch(
					joinLobby({
						lobbyId,
						playerName,
						createLobbyIfNotExists: true
					})
				);
			} else {
				navigate('/')
			}
		}
	}, [isSocketConnected, lobby]);

	return <> </>;
}
