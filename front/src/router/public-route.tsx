import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'front/store/hook';

function PublicRoute({ children }: { children: JSX.Element }) {
    const playerName = useAppSelector(state => state.player.name);

    if (playerName)
        return <Navigate to="/lobby" />;
    return children;
}

export default PublicRoute;