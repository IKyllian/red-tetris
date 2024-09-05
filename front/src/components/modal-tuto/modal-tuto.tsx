
import { FaArrowUp, FaArrowRight, FaArrowDown, FaArrowLeft } from "react-icons/fa6";
import { MdSpaceBar } from "react-icons/md";
import './modal-tuto.css'

const ModalTuto = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="modal-container">
            <h2> Comment jouer ?</h2>
            <ul>
                <li className="flex flex-row items-center gap8"><span> <FaArrowUp /> </span> Rotation </li>
                <li className="flex flex-row items-center gap8"><span> <FaArrowRight /> </span> Bouger a droite </li>
                <li className="flex flex-row items-center gap8"><span> <FaArrowDown /> </span> Descendre de 1 bloc </li>
                <li className="flex flex-row items-center gap8"><span> <FaArrowLeft /> </span> Bouger a gauche </li>
                <li className="flex flex-row items-center gap8"><span> <MdSpaceBar /> </span> Hard drop </li>
            </ul>
            <button onClick={onClose} className="button"> Fermer </button>
        </div>
    )
}

export default ModalTuto