import React from 'react';
import styles from './styles/AdminPanel.module.css'
import axios from "axios";
import {useNavigate} from "react-router-dom";

function AdminPanel(props) {

    const navigate = useNavigate();

    function deleteRestaurant() {
        axios.delete("http://localhost:8080/delete-rest?id="+props.id).then((response)=>{
            if(response.status===200) navigate("/main",{replace: true});
        })
    }

    return (
        <div className={styles.absolutePanel}>
            <div className={styles.changeToggleDiv}>
                <a className={styles.changeToggle} id="changeToggle" href={"change-rest?id="+props.id}>
                    <img src="/images/mech.png"/>
                    <p>Изменить</p>
                </a>
            </div>
            <div className={styles.deleteToggleDiv}>
                <button className={styles.deleteToggle} id="deleteToggle" onClick={deleteRestaurant}>
                    <img src="/images/trash.png"/>
                    <p>Удалить</p>
                </button>
            </div>
        </div>
    );
}

export default AdminPanel;