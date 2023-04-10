import React from 'react';
import styles from "./styles/NoAuthorizedPart.module.css";
import {Link} from "react-router-dom";
function NoAuthorizedPart(props) {
    return (
        <div className={styles.noAuth}>
            <h1 className={styles.message}>{props.message}</h1>
            <h2 className={styles.advice}>{props.advice}</h2>
            <Link className={styles.login} to={props.href}>{props.linkText}</Link>
        </div>
    );
}

export default NoAuthorizedPart;