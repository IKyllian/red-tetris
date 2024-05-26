import ReactDOM from "react-dom/client";
import "./index.css";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router.tsx";
import "./css/rules.css";
import { initSocket } from "./store/socket.slice.ts";

store.dispatch(initSocket());

ReactDOM.createRoot(document.getElementById("root")!).render(
	// <React.StrictMode>
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
	// </React.StrictMode>,
);
