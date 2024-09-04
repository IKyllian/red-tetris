import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { createLobby, joinLobby, sendStartGame } from "front/store/lobby.slice";
import { useForm } from "react-hook-form";
import "./home.css";
import { useEffect, useState } from "react";
import ModalTuto from 'front/components/modal-tuto/modal-tuto';
import React from 'react';

interface JoinFormValues {
	lobbyId: string;
}

interface CreateFormValues {
	lobbyName: string;
}

export function CreateGameButton({ playerName }: { playerName: string }) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateFormValues>();
	const dispatch = useAppDispatch();

	const handleCreateLobby = (data: CreateFormValues) => {
		dispatch(
			createLobby({
				name: data.lobbyName,
				playerName: playerName,
			})
		);
	};

	return (
		<form data-testid='form' onSubmit={handleSubmit(handleCreateLobby)} className="home-form">
			<input
				autoComplete="off"
				className="input"
				type="text"
				placeholder="Name"
				style={{ borderColor: "#bab8df" }}
				{...register("lobbyName", { required: true })}
			/>
			{errors.lobbyName && errors.lobbyName.message && (
				<p data-testid='form-error' className="error-message"> {errors.lobbyName.message} </p>
			)}
			<button data-testid='form-button' className="button" type="submit">
				Creer lobby
			</button>
		</form>
	);
}

export function JoinGameButton({ playerName }: { playerName: string }) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<JoinFormValues>();
	const dispatch = useAppDispatch();

	const handleJoinLobby = (data: JoinFormValues) => {
		dispatch(
			joinLobby({
				lobbyId: data.lobbyId,
				playerName: playerName,
				createLobbyIfNotExists: false
			})
		);
	};

	return (
		<form data-testid='form' onSubmit={handleSubmit(handleJoinLobby)} className="home-form">
			<input
				autoComplete="off"
				className="input"
				type="text"
				placeholder="Lobby Id"
				style={{ borderColor: "#bab8df" }}
				{...register("lobbyId", { required: true })}
			/>
			{errors.lobbyId && errors.lobbyId.message && (
				<p data-testid='form-error' className="error-message"> {errors.lobbyId.message} </p>
			)}
			<button data-testid='form-button' className="button" type="submit">
				Rejoindre lobby
			</button>
		</form>
	);
}

export const GAME_MODE = [
	{
		title: "solo",
		description: "Jouez solo et faites le meilleur score possible",
		color: "#34222d",
		textColor: "#f1bcdb",
	},
	{
		title: "liste des lobby",
		description: "Liste de tous les lobby",
		color: "#1c263e",
		textColor: "#88afff",
		path: "/lobby-list",
	},
	{
		title: "leaderboard",
		description: "Top 10 des meilleurs scores en solo",
		color: "#3b4746",
		textColor: "#a7d1cf",
		path: "/leaderboard",
	},
	{
		title: "Comment jouer ?",
		description: "Liste des touches pour jouer à Tetris",
		color: "#212121",
		textColor: "#bfbfbf",
	},
];

export default function Home() {
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const playerName = useAppSelector((state) => state.player.name);
	const lobby = useAppSelector((state) => state.lobby);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (lobby?.gameStarted) {
			navigate("/game");
		} else if (lobby) {
			navigate("/lobby");
		}
	}, [lobby]);

	const handleClick = (path: string | undefined) => {
		if (path) {
			navigate(path);
		} else {
			dispatch(sendStartGame({ playerName }));
		}
	};

	const handleClickModal = () => setModalOpen(prev => !prev)
	const renderLobbyButton = () => (
		<div
			className="game-mode-item flex flex-row content-evenly"
			style={{
				backgroundColor: "#1e1d2d",
				color: "#bab8df",
				border: "1px solid #bab8df",
			}}
		>
			<div className="flex flex-col">
				<span className="game-mode-title">Creer un lobby</span>
				<CreateGameButton playerName={playerName} />
			</div>

			<div className="flex flex-col">
				<span className="game-mode-title">
					Rejoindre un lobby
				</span>
				<JoinGameButton playerName={playerName} />
			</div>
		</div>
	)

	return (
		<div className="home-container">
			{ modalOpen && <ModalTuto onClose={handleClickModal} /> }
			<div className="game-mode-list flex flex-col gap12">
				{GAME_MODE.map((gameMode, index) => (
					<React.Fragment key={index}>
						<div
							data-testid="tetris-letter"
							onClick={() => index === GAME_MODE.length - 1 ? handleClickModal() : handleClick(gameMode.path)}
							className="game-mode-item flex flex-col"
							style={{
								backgroundColor: gameMode.color,
								color: gameMode.textColor,
								border: "1px solid " + gameMode.textColor,
							}}
						>
							<span className="game-mode-title">
								{gameMode.title}
							</span>
							<span className="game-mode-description">
								{gameMode.description}
							</span>
						</div>
						{ index === 0 ? renderLobbyButton() : null}
					</React.Fragment>
				))}
			</div>
		</div>
	);
}
