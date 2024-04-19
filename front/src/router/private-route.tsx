import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hook';

function PrivateRoute({ children }: { children: JSX.Element }) {
    const playerName = useAppSelector(state => state.player.name);

    if (!playerName)
        return <Navigate to="/" />;
    return children;
}

export default PrivateRoute;