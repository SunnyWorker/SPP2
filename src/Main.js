import React, {useContext, useEffect, useState} from 'react';
import MainContent from "./MainContent";
import FilterPanel from "./FilterPanel";
import FilterSlider from "./FilterSlider";
import FilterContext from './FilterContext';
import axios from "axios";
import RestaurantContext from "./RestaurantContext";
import {useSearchParams} from "react-router-dom";

function Main() {

    const [filter, setFilter] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [images, setImages] = useState([]);
    const [searchParams] = useSearchParams();

    const getRestaurants = () => {
        axios.get("http://localhost:8080/getAllRestaurants?"+searchParams.toString())
            .then(response => {
                setRestaurants(response.data.restaurants);
            });
        axios.get("http://localhost:8080/getMainImages")
            .then(response => {
                setImages(response.data.images);
            });
    }

    const poll = () => {
        axios.get("http://localhost:8080/long-polling")
            .then(response => {
                if(response.data.message==="updated") getRestaurants();
                poll();
            });
    }

    useEffect(()=>{
        getRestaurants();
        poll();
    },[]);

    return (
        <RestaurantContext.Provider value={{restaurants, setRestaurants, images, setImages}}>
            <FilterContext.Provider value={{ filter, setFilter }}>
                <MainContent/>
                <FilterPanel/>
                <FilterSlider/>
            </FilterContext.Provider>
        </RestaurantContext.Provider>

    );
}

export default Main;