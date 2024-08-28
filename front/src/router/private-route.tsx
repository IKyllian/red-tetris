import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'front/store/hook';
import Header from 'front/components/header/header';
import Alert from 'front/components/alert/alert';

function PrivateRoute({ children }: { children: JSX.Element }) {
    const player = useAppSelector(state => state.player);

    if (!player)
        return <Navigate to="/" />;
    return (
        <>
            <Header />
            <Alert />
            {children}
        </>
           
    );
}

export default PrivateRoute;