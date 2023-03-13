import React, {useEffect, useState} from 'react';
import Header from "./Header";
import styles from './styles/RestaurantPage.module.css';
import AdminPanel from "./AdminPanel";
import {useSearchParams} from "react-router-dom";
import axios from "axios";

function RestaurantPage() {

    const [searchParams] = useSearchParams();
    const [restaurant, setRestaurant] = useState();
    const [images, setImages] = useState();

    const getRestaurant = () => {
        axios.get("http://localhost:8080/getRestaurantById?id="+searchParams.get("id"))
            .then(response => {
                setRestaurant(response.data.restaurant);
            });
        axios.get("http://localhost:8080/getImages?id="+searchParams.get("id"))
            .then(response => {
                setImages(response.data.images);
            });
    }

    const poll = () => {
        axios.get("http://localhost:8080/long-polling")
            .then(response => {
                if(response.data.message==="updated") getRestaurant();
                poll();
            });
    }

    useEffect(()=>{
        getRestaurant();
        poll();
    },[]);

    function getGuestCountWord(capacity) {
        if(capacity%100<10 || capacity%100>20) {
            if(capacity%10>=2 && capacity%10<=4) return capacity+' гостя'
            else if(capacity%10===1) return capacity+' гость'
        }
        return capacity+' гостей'
    }

    if(restaurant && images) {
        return (
            <>
                <Header/>
                <div className={styles.main}>
                    <div className={styles.nameNImage}>
                        <div className={styles.name}>
                            <h1 className={`${styles.nameObject} ${styles.appearFromLeft}`} id="alright">
                                {restaurant.r_name}
                            </h1>
                            <h2 className={`${styles.nameObject} ${styles.appearFromLeft}`}>
                                Ценовая категория: {restaurant.r_price}
                            </h2>
                            <h2 className={`${styles.nameObject} ${styles.appearFromLeft}`}>
                                Вместительность: {getGuestCountWord(restaurant.r_capacity)}
                            </h2>
                            <h2 className={`${styles.nameObject} ${styles.appearFromLeft}`}>
                                Адрес: {restaurant.r_address}
                            </h2>
                        </div>
                        <div className={`${styles.image} ${styles.appearFromRight}`}>
                            <img src={"/images/" + images[0].i_filepath} alt={""}/>
                        </div>
                    </div>
                    <div className={styles.description}>
                        <h2 className={styles.nameObject}>Описание</h2>
                        <span className={styles.text}>{restaurant.r_description}</span>
                    </div>
                </div>
                <AdminPanel id={restaurant.r_id}/>
            </>
        );
    }
}

export default RestaurantPage;