import React, {useContext, useEffect} from 'react';
import styles from "../styles/AdminPanel.module.css";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import {useCookies} from "react-cookie";

function DeleteButton(props) {

    const navigate = useNavigate();
    const {socket} = useContext(UserContext);
    const [cookies] = useCookies(['JWT']);

    function deleteRestaurant() {
        let req = {};
        req.id = props.id;
        req.cookies = cookies;
        socket.emit('delete-rest',req);
    }

    useEffect(()=>{
        socket.on('Ресторан удалён!', () => {
            navigate("/main",{replace: true});
        });
    },[]);

    return (
        <div className={`${styles.delete}  ${styles.toggleDiv}`}>
            <button className={`${styles.deleteToggle}  ${styles.toggle}`} id="deleteToggle" onClick={deleteRestaurant}>
                <img src="/images/trash.png"/>
                <p>Удалить</p>
            </button>
        </div>
    );
}

export default DeleteButton;