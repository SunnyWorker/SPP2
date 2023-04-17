import React, {useContext, useEffect, useState} from 'react';
import Header from "./Header";
import styles from './styles/RestaurantPage.module.css';
import AbsolutePanel from "./buttons/AbsolutePanel";
import {useNavigate, useSearchParams} from "react-router-dom";
import ChangeButton from "./buttons/ChangeButton";
import DeleteButton from "./buttons/DeleteButton";
import LoginButton from "./buttons/LoginButton";
import LogoutButton from "./buttons/LogoutButton";
import UserContext from "./contexts/UserContext";
import NoAuthorizedPart from "./NoAuthorizedPart";
import {useCookies} from "react-cookie";

function RestaurantPage() {

    const [searchParams] = useSearchParams();
    const [restaurant, setRestaurant] = useState();
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState();
    const navigate = useNavigate();
    const {user, getUser, socket} = useContext(UserContext);
    const [cookies] = useCookies(['JWT']);

    const getRestaurant = () => {
        let req = {};
        req.id = searchParams.get("id");
        req.cookies = cookies;
        socket.emit("getRestaurantById", req);
        socket.emit("getImages", req);
    }

    useEffect(()=>{
        getRestaurant();
        getUser();

        socket.on("getRestaurantById", (restaurant) => {
            if(!restaurant) navigate("/main",{replace:true})
            setRestaurant(restaurant);
        });

        socket.on("getImages", (images) => {
            setImages(images);
        });

        socket.on('Unauthorized', (restaurant) => {
            setRestaurant("");
            setImages("");
        });

        socket.on("update", () => {
            getRestaurant();
        });
    },[]);

    useEffect(()=>{
        if(restaurant!=undefined && images!=undefined && user!=undefined) setLoading(false)
    },[restaurant , images , user]);

    function getGuestCountWord(capacity) {
        if(capacity%100<10 || capacity%100>20) {
            if(capacity%10>=2 && capacity%10<=4) return capacity+' гостя'
            else if(capacity%10===1) return capacity+' гость'
        }
        return capacity+' гостей'
    }

    if(loading) {
        return (
            <Header/>
        )
    }
    else if(images!=="" && restaurant!=="" && user!=="") {
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
                            <img src={"/images/" + images[0].ri_filepath} alt={""}/>
                        </div>
                    </div>
                    <div className={styles.description}>
                        <h2 className={styles.nameObject}>Описание</h2>
                        <span className={styles.text}>{restaurant.r_description}</span>
                    </div>
                </div>
                <AbsolutePanel>
                    {user.u_id === restaurant.r_owner_id || user.role_name===process.env.REACT_APP_ADMIN_ROLE? <ChangeButton id={restaurant.r_id}/> : null}
                    {user.u_id === restaurant.r_owner_id || user.role_name===process.env.REACT_APP_ADMIN_ROLE? <DeleteButton id={restaurant.r_id}/> : null}
                    {user === "" ? <LoginButton/> : <LogoutButton/>}
                </AbsolutePanel>
            </>
        );
    }
    else if(user==="") {
        return (
            <>
                <Header/>
                <NoAuthorizedPart message={"Вы не авторизованы, доступ к информации ограничен!"} advice={"Но вы всегда можете это исправить!"}  href={"/login"} linkText={"Войти"}/>
            </>
        )
    }
}

export default RestaurantPage;