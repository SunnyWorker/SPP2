import React, {useContext, useEffect} from 'react';
import styles from "../styles/AdminPanel.module.css";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import {useCookies} from "react-cookie";

function LogoutButton(props) {
    const {getUser, socket} = useContext(UserContext);
    const [cookies, setCookies, clearCookies] = useCookies(['JWT']);
    const navigate = useNavigate();

    function logout() {
        let req = {};
        req.cookies = cookies;
        socket.emit('logout',req);
    }

    useEffect(()=>{
        socket.on("clear-cookie", (cookie) => {
            navigate("/main",{replace:true})
        });
    },[]);

    return (
        <div className={`${styles.logout}  ${styles.toggleDiv}`}>
            <button className={`${styles.logoutToggle}  ${styles.toggle}`} id="logoutToggle" onClick={logout}>
                <img src="/images/logout.png"/>
                <p>Выйти</p>
            </button>
        </div>
    );
}

export default LogoutButton;