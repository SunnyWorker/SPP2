import React from 'react';
import styles from "../styles/AdminPanel.module.css";
import {Link} from "react-router-dom";

function RegistrationButton(props) {
    return (
        <div className={`${styles.registration}  ${styles.toggleDiv}`}>
            <Link className={`${styles.registrationToggle}  ${styles.toggle}`} id="registrationToggle" to={"/registration"}>
                <img src="/images/login.png"/>
                <p>Регистрация</p>
            </Link>
        </div>
    );
}

export default RegistrationButton;