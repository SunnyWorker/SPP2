import React, {useContext, useEffect, useState} from 'react';
import MainContent from "./MainContent";
import FilterButton from "./buttons/FilterButton";
import FilterSlider from "./FilterSlider";
import FilterContext from './contexts/FilterContext';
import RestaurantContext from "./contexts/RestaurantContext";
import {useSearchParams} from "react-router-dom";
import AbsolutePanel from "./buttons/AbsolutePanel";
import LoginButton from "./buttons/LoginButton";
import UserContext from "./contexts/UserContext";
import LogoutButton from "./buttons/LogoutButton";
import {useCookies} from "react-cookie";

function Main() {

    const [filter, setFilter] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [images, setImages] = useState([]);
    const [searchParams] = useSearchParams();
    const {user, getUser, socket} = useContext(UserContext);
    const [cookies] = useCookies(['JWT']);

    const getRestaurants = () => {
        let req = {};
        req.name = searchParams.get("name");
        req.price = searchParams.get("price");
        req.capacityFrom = searchParams.get("capacityFrom");
        req.capacityTo = searchParams.get("capacityTo");
        req.cookies = cookies;
        socket.emit("getAllRestaurants", req);
        socket.emit("getMainImages", req);
    }

    useEffect(()=>{
        getRestaurants();

        socket.on("getAllRestaurants", (restaurants) => {
            setRestaurants(restaurants);
        });

        socket.on("getMainImages", (images) => {
            setImages(images);
        });

        socket.on("update", () => {
            getRestaurants();
        });
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