import { createBrowserRouter } from "react-router-dom";
import Register from "front/components/sign/sign";
import Home from "front/components/home/home";
import PrivateRoute from "front/router/private-route";
import PublicRoute from "front/router/public-route";
import Lobby from "front/components/lobby/lobby";
import JoinLobbyByPath from "front/components/lobby/join-lobby-by-path";
import Game from "front/components/game/game";
import RoomsList from "front/components/rooms-list/rooms-list";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<PublicRoute>
				<Register />
			</PublicRoute>
		),
	},
	{
		path: "home",
		element: (
			<PrivateRoute>
				<Home />
			</PrivateRoute>
		),
	},
	{
		path: "lobby",
		element: (
			<PrivateRoute>
				<Lobby />
			</PrivateRoute>
		),
	},
	{
		path: "/:lobbyId/:playerName",
		element: (
			// <PrivateRoute>
			<JoinLobbyByPath />
			// </PrivateRoute>
		),
	},
	{
		path: "game",
		element: (
			<PrivateRoute>
				<Game />
			</PrivateRoute>
		),
	},
	{
		path: "room-list",
		element: (
            <PrivateRoute>
				<RoomsList />
			</PrivateRoute>
		)
	}
]);
