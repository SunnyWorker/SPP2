import React, {useContext} from 'react';
import styles from "../styles/AdminPanel.module.css";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import UserContext from "../contexts/UserContext";

function LogoutButton(props) {

    const navigate = useNavigate();
    const {user, getUser} = useContext(UserContext);
    const config = {
        withCredentials: true
    }

    function logout() {
        axios.post("http://localhost:8080/logout","",config).then((response)=>{
            if(response.status===200) {
                getUser();
                navigate("/main",{replace: true});
            }
        }).catch(reason => {
            alert("Вы не авторизованы!")
        })
    }

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