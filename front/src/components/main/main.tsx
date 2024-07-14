import ReactDOM from "react-dom/client";
import "./index.css";
import { store } from "front/store/store";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "front/router/router";
import "front/css/rules.css";
import { initSocket } from "front/store/socket.slice";

store.dispatch(initSocket());
ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
);
