import { useAppDispatch, useAppSelector } from "front/store/hook";
import "./lobby-list.css";
import { FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ILobby } from "front/types/lobby.type";
import { IoMdRefresh } from "react-icons/io";
import { joinLobby } from "front/store/lobby.slice";
import { useNavigate } from "react-router-dom";
import { getLobbyList } from "front/api/lobby.api";

export default function LobbyList() {
	const [lobbies, setLobbies] = useState<ILobby[]>([]);
	const [refresh, setRefresh] = useState<boolean>(true);
	const playerName = useAppSelector((state) => state.player.name);
	const lobby = useAppSelector((state) => state.lobby);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	useEffect(() => {
		if (refresh) {
			const fetchData = async () => {
				const data = await getLobbyList();
				setLobbies(data);
				setRefresh(false);
			}
			fetchData()
		}
	}, [refresh]);

	useEffect(() => {
		if (lobby) {
			navigate("/lobby");
		}
	}, [lobby]);

	const handleJoinLobby = (lobbyId: string) => {
		dispatch(
			joinLobby({
				lobbyId,
				playerName,
			})
		);
	};

	return (
		<div className="page-wrapper flex flex-col content-center items-center gap16">
			<div className="flex flex-row items-center gap16">
				<h2>Liste de lobby</h2>
				<IoMdRefresh
					onClick={() => setRefresh(true)}
					style={{
						fontSize: "30px",
						cursor: "pointer",
						border: "1px solid white",
						borderRadius: "50%",
						padding: "5px",
					}}
				/>
			</div>
			<div className="rooms-list-container flex flex-col gap8">
				{lobbies.length === 0 ? (
					<div data-testid="no-lobbies-message" className="no-lobbies-message">
						No lobbies available
					</div>
				) : (
					lobbies.map((lobby, index) => {
						const leaderName = lobby.players.find(
							(player) => player.isLeader
						)?.name; // TODO: do we keep leader?
						const canJoin: boolean =
							!lobby.gameStarted &&
							lobby.players.length < lobby.maxPlayers;
						return (
							<div
								key={index}
								data-testid="lobby-list-item"
								className="room-list-item flex flex-row content-between items-center"
								onClick={() =>
									canJoin && handleJoinLobby(lobby.id)
								}
								style={{
									cursor: canJoin ? "pointer" : "default",
								}}
							>
								<div className="flex flex-col">
									<span className="lobby-name">
										{lobby.name}
									</span>
									<span className="lobby-info">
										{lobby.gameStarted
											? "In game"
											: "In lobby"}
										{" - "}
										{leaderName}
									</span>
								</div>
								<div className="flex flex-row gap4 items-center">
									<span className="lobby-name">
										{lobby.players.length}/
										{lobby.maxPlayers}
									</span>
									<FaUsers />
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
