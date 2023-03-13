import React, {useContext, useEffect, useState} from 'react';
import RestaurantElement from "./RestaurantElement";
import './styles/RestaurantList.css';
import RestaurantContext from "./RestaurantContext";

function RestaurantList() {

    const {restaurants, images} = useContext(RestaurantContext);

    return (
        <div className="rests">
            {restaurants.map((restaurant) => {
                return <RestaurantElement restaurant={restaurant} image={images[restaurant.r_id]}/>
            })}
            <a href="/add-rest" className="rest rest-add">
                <img src={"/images/plus.png"} alt={""}/>
            </a>
        </div>
    );
}

export default RestaurantList;