import { useForm } from "react-hook-form";
import { useAppDispatch } from "front/store/hook";
import { sign } from "front/store/player.slice";
import { useNavigate } from "react-router-dom";
import "./sign.css";
import { initSocket } from "front/store/socket.slice";

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

	const onSubmit = (data: FormValues): void => {
		console.log(data);
		dispatch(sign(data.name));
		// dispatch(initSocket());
		navigate("/home");
	};

	return (
		<div className="form-container flex flex-col content-center items-center">
			<h4> Chose a name :</h4>
			<form onSubmit={handleSubmit(onSubmit)} className="">
				<input
					className="input"
					type="text"
					placeholder="Name"
					{...register("name", { required: true })}
				/>
				{errors.name && errors.name.message && (
					<p className="error-message"> {errors.name.message} </p>
				)}
				<button className="button" type="submit">Submit</button>
			</form>
		</div>
	);
}
