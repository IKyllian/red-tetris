import {
  createBrowserRouter,
} from "react-router-dom";
import { SignIn } from '../components/sign/sign.tsx'
import { Lobby } from "../components/lobby/lobby.tsx";
import PrivateRoute from "./private-route.tsx";
import PublicRoute from "./public-route.tsx";

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
    path: "lobby",
    element: (
      <PrivateRoute>
        <Lobby />
      </PrivateRoute>
    ),
  },
]);
