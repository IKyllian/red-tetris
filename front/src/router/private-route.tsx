import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'front/store/hook';
import Header from 'front/components/header/header';
import { leaveLobby } from 'front/store/lobby.slice';

function PrivateRoute({ children }: { children: JSX.Element }) {
    const player = useAppSelector(state => state.player);
    const location = useLocation()
    const lobby = useAppSelector(state => state.lobby);
    const dispatch = useAppDispatch()

    console.log(location.pathname)
    // if (location.pathname !== '/lobby' && location.pathname !== '/game' && lobby.id || lobby.id !== '' || lobby.gameStarted) {
    //     dispatch(leaveLobby(lobby.id));
    // }
    if (!player)
        return <Navigate to="/" />;
    return (
        <>
            <Header />
            {children}
        </>
           
    );
}

export default PrivateRoute;