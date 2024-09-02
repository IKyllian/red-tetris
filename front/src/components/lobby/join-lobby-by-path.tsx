import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { sign } from "front/store/player.slice";
import { useEffect } from "react";
import { joinLobby } from "front/store/lobby.slice";
import { AlertType } from "front/store/alert.slice";

export default function JoinLobbyByPath() {
	const { lobbyId, playerName } = useParams();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { isSocketConnected } = useAppSelector(state => state.socket)
	const lobby = useAppSelector(state => state.lobby)
    const alerts = useAppSelector(state => state.alerts);

	useEffect(() => {
		if (alerts?.alerts?.find(alert => alert.type === AlertType.LOBBY_ERROR)) {
			navigate("/");
		}
	}, [alerts])

	useEffect(() => {
		if (isSocketConnected && lobbyId && playerName) {
			if (lobby) {
				navigate("/lobby");
			} else {
				dispatch(sign(playerName));
				dispatch(
					joinLobby({
						lobbyId,
						playerName,
						createLobbyIfNotExists: true
					})
				);
			}
		}
	}, [isSocketConnected, lobby]);

	return <> </>;
}
