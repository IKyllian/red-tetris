import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "front/store/hook";
import { AlertState, AlertType, removeAlert } from "front/store/alert.slice";
import { FaCheck } from "react-icons/fa";
import { IoIosAlert, IoMdClose } from "react-icons/io";
import './alert.css'

function AlertItem(props: {elem: AlertState}) {
    const {elem} = props;
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);
    const dispatch = useAppDispatch();

    const closeSuccess = (id: number) => {
        clearTimeout(timeoutId);
        dispatch(removeAlert(id));
    }

    const getClass = (type: AlertType): string => {
        if (type === AlertType.ERROR || type === AlertType.LOBBY_ERROR)
            return "error";
        else if (type === AlertType.SUCCESS)
            return "success";
        return "warning";
    }

    useEffect(() => {
        setTimeoutId(setTimeout(() => {
            dispatch(removeAlert(elem.id));
        }, 5000));

        return () => {
            clearTimeout(timeoutId);
        }
    }, [])

    return (

        <div key={elem.id} className={`notif-wrapper notif-${getClass(elem.type)}`}>
            <div className="notif-content-container">
                <div className="icon-wrapper">
                    { elem.type === AlertType.SUCCESS && <FaCheck /> }
                    { elem.type === AlertType.ERROR || elem.type === AlertType.LOBBY_ERROR && <IoMdClose /> }
                    { elem.type === AlertType.WARNING && <IoIosAlert /> }
                </div>
                <p> {elem.message} </p>
                <IoMdClose className="close-notif" onClick={() => closeSuccess(elem.id)} />
            </div>
        </div>
    );
}

function Alert() {
    const { alerts } = useAppSelector(state => state.alerts);

    return alerts.length > 0 ? (
        <div className="notif-container">
            {
                alerts.map(elem => 
                    <AlertItem key={elem.id} elem={elem} />
                )
            }
        </div>
    ) : (
        <> </>
    );
}

export default Alert;