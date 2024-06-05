import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'front/store/hook';
import { Header } from 'front/components/header/header';

function PrivateRoute({ children }: { children: JSX.Element }) {
    const playerName = useAppSelector(state => state.player.name);

    if (!playerName)
        return <Navigate to="/" />;
    return (
        <>
            <Header />
            {children}
        </>
           
    );
}

export default PrivateRoute;