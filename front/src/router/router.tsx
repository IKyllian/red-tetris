import { createBrowserRouter } from "react-router-dom";
import { SignIn } from "front/components/sign/sign.tsx";
import { Home } from "front/components/home/home.tsx";
import PrivateRoute from "front/router/private-route.tsx";
import PublicRoute from "front/router/public-route.tsx";
import { Lobby } from "front/components/lobby/lobby.tsx";
import { JoinLobbyByPath } from "front/components/lobby/join-lobby-by-path.tsx";
import { Game } from "front/components/game/game.tsx";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<PublicRoute>
				<SignIn />
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
]);
