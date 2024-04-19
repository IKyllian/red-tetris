import { useNavigate } from 'react-router-dom';

export function Home() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/lobby');
    }
    return (
        <div className="home-container flex content-center items-center">
            <div className="buttons-container flex flex-row gap8">
                <button type="button" onClick={handleClick}> Create Game </button>
                <button type="button" onClick={handleClick}> Join Game </button>
            </div>
        </div>
    );
}