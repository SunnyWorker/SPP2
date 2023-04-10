import React from 'react';
import styles from "../styles/AdminPanel.module.css";
import {Link} from "react-router-dom";

function LoginButton(props) {
    return (
        <div className={`${styles.login}  ${styles.toggleDiv}`}>
            <Link className={`${styles.loginToggle}  ${styles.toggle}`} id="loginToggle" to={"/login"}>
                <img src="/images/login.png"/>
                <p>Войти</p>
            </Link>
        </div>
    );
}

export default LoginButton;