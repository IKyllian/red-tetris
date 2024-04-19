export function Lobby() {
    return (
        <div className="lobby-container flex content-center items-center">
            <div className="buttons-container flex flex-row gap8">
                <button type="button"> Create Game </button>
                <button type="button"> Join Game </button>
            </div>
        </div>
    );
}