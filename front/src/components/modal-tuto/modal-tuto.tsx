
import { FaArrowUp, FaArrowRight, FaArrowDown, FaArrowLeft } from "react-icons/fa6";
import { MdSpaceBar } from "react-icons/md";
import './modal-tuto.css'

const ModalTuto = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="modal-container">
            <h2> Comment jouer ?</h2>
            <ul>
                <li className="flex flex-row items-center gap8"><span> <FaArrowUp /> </span> Retouner la piece </li>
                <li className="flex flex-row items-center gap8"><span> <FaArrowRight /> </span> Bouger la piece a droite </li>
                <li className="flex flex-row items-center gap8"><span> <FaArrowDown /> </span> Faire descendre la piece de 1 bloc </li>
                <li className="flex flex-row items-center gap8"><span> <FaArrowLeft /> </span> Bouger la piece a gauche </li>
                <li className="flex flex-row items-center gap8"><span> <MdSpaceBar /> </span> Faire tomber la piece </li>
            </ul>
            <button onClick={onClose} className="button"> Fermer </button>
        </div>
    )
}

export default ModalTuto