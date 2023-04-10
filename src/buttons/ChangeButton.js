import React from 'react';
import styles from "../styles/AdminPanel.module.css";
import {Link} from "react-router-dom";

function ChangeButton(props) {
    return (
        <div className={`${styles.change}  ${styles.toggleDiv}`}>
            <Link to={"/change-rest?id="+props.id}  className={`${styles.changeToggle}  ${styles.toggle}`} id="changeToggle">
                <img src="/images/mech.png"/>
                <p>Изменить</p>
            </Link>
        </div>
    );
}

export default ChangeButton;