import ReactDOM from "react-dom/client";
import "./index.css";
import { store } from "front/store/store";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "front/router/router";
import "front/css/rules.css";
import { initSocket } from "front/store/socket.slice";
// import { createBrowserHistory } from "history";

store.dispatch(initSocket());

// export const history = createBrowserHistory();

ReactDOM.createRoot(document.getElementById("root")!).render(
	// <React.StrictMode>
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
	// </React.StrictMode>,
);
