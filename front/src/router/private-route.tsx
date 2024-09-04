import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'front/store/hook';
import Header from 'front/components/header/header';
import Alert from 'front/components/alert/alert';
import { useState } from 'react';

function PrivateRoute({ children }: { children: JSX.Element }) {
    const [displayModal, setDisplayModal] = useState<boolean>(false)
    const player = useAppSelector(state => state.player);
    const handleClick = () => setDisplayModal(prev => !prev)

    if (!player)
        return <Navigate to="/" />;
    return (
        <>
            <Header handleTutoClick={handleClick} />
            <Alert />
            {children}
        </>
           
    );
}

export default PrivateRoute;