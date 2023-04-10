import React from 'react';
import styles from '../styles/AdminPanel.module.css'

function AbsolutePanel(props) {

    return (
        <div className={styles.absolutePanel}>
            {props.children}
        </div>
    );
}

export default AbsolutePanel;