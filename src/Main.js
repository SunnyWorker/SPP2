import React, {useContext, useEffect, useState} from 'react';
import MainContent from "./MainContent";
import FilterButton from "./buttons/FilterButton";
import FilterSlider from "./FilterSlider";
import FilterContext from './contexts/FilterContext';
import axios from "axios";
import RestaurantContext from "./contexts/RestaurantContext";
import {useSearchParams} from "react-router-dom";
import AbsolutePanel from "./buttons/AbsolutePanel";
import LoginButton from "./buttons/LoginButton";
import UserContext from "./contexts/UserContext";
import LogoutButton from "./buttons/LogoutButton";

function Main() {

    const [filter, setFilter] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [images, setImages] = useState([]);
    const [searchParams] = useSearchParams();
    const {user, getUser} = useContext(UserContext);
    const config = {
        withCredentials: true
    }
    const getRestaurants = () => {
        axios.get("http://localhost:8080/getAllRestaurants?"+searchParams.toString(),config)
            .then(response => {
                setRestaurants(response.data.restaurants);
            });
        axios.get("http://localhost:8080/getMainImages",config)
            .then(response => {
                setImages(response.data.images);
            });
    }

    const poll = () => {
        axios.get("http://localhost:8080/long-polling",config)
            .then(response => {
                if(response.data.message==="updated") getRestaurants();
                poll();
            });
    }

    useEffect(()=>{
        getUser();
    },[]);

    useEffect(()=>{
        getRestaurants();
        poll();
    },[user]);

    return (
        <RestaurantContext.Provider value={{restaurants, setRestaurants, images, setImages}}>
            <FilterContext.Provider value={{ filter, setFilter}}>
                <MainContent/>
                <AbsolutePanel>
                    {user == undefined || user === "" ? null : <FilterButton/>}
                    {user == undefined || user === "" ? <LoginButton/> : <LogoutButton/>}
                </AbsolutePanel>
                {user == undefined || user === "" ? null : <FilterSlider/>}
            </FilterContext.Provider>
        </RestaurantContext.Provider>

    );
}

export default Main;