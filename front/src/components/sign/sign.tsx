import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { sign } from "front/store/player.slice";
import { useNavigate } from "react-router-dom";
import "./sign.css";
import { useEffect } from "react";

interface FormValues {
	name: string;
}

export default function Register() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { isSocketConnected } = useAppSelector(state => state.socket)
	const player = useAppSelector(state => state.player)

	const onSubmit = (data: FormValues): void => {
		dispatch(sign(data.name));
	};

	useEffect(() => {
		if (player && isSocketConnected) {
			navigate("/home");
		}
	}, [player, isSocketConnected])

	return (
		<div className="form-container flex flex-col content-center items-center">
			<h4> Choisir un nom :</h4>
			<form data-testid="form-register" className="form" onSubmit={handleSubmit(onSubmit)}>
				<input
					className="input"
					type="text"
					placeholder="Name"
					{...register("name", { required: true })}
				/>
				{errors.name && errors.name.message && (
					<p data-testid='error' className="error-message"> {errors.name.message} </p>
				)}
				<button data-testid="submit-button" className="button" type="submit" name="submit">Valider</button>
			</form>
		</div>
	);
}
