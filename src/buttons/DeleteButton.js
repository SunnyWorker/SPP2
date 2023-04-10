import React from 'react';
import styles from "../styles/AdminPanel.module.css";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

function DeleteButton(props) {

    const navigate = useNavigate();

    const config = {
        'withCredentials': true
    }

    function deleteRestaurant() {
        axios.delete("http://localhost:8080/delete-rest?id="+props.id,config).then((response)=>{
            if(response.status===200) navigate("/main",{replace: true});
        })
    }

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