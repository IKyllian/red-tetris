import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'front/store/hook';
import { Header } from 'front/components/header/header';

function PublicRoute({ children }: { children: JSX.Element }) {
    const player = useAppSelector(state => state.player);

    if (player)
        return <Navigate to="/home" />;
    return (
        <>
            <Header />
            {children}
        </>
    );
}

export default PublicRoute;