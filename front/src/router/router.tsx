import {
  createBrowserRouter,
} from "react-router-dom";
import { SignIn } from '../components/sign/sign.tsx'
import { Home } from "../components/home/home.tsx";
import PrivateRoute from "./private-route.tsx";
import PublicRoute from "./public-route.tsx";
import { Lobby } from "../components/lobby/lobby.tsx";
import { Game } from "../components/game/game.tsx";

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
    path: "game",
    element: (
      <PrivateRoute>
        <Game />
      </PrivateRoute>
    ),
  },
]);
