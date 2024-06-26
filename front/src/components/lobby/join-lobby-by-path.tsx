import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "front/store/hook";
import { setName } from "front/store/player.slice";
import { initSocket } from "front/store/socket.slice";
import { useEffect } from "react";
import { joinLobby } from "front/store/lobby.slice";

export function JoinLobbyByPath() {
	const params = useParams();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	console.log("Params = ", params);

	useEffect(() => {
		const { lobbyId, playerName } = params;
		console.log("join by path: ", lobbyId, playerName);
		if (lobbyId && playerName) {
			// dispatch(initSocket());
			dispatch(setName(playerName));
			dispatch(
				joinLobby({
					lobbyId,
					playerName,
				})
			);
			navigate("/lobby");
		}
	}, []);

	return <> </>;
}
