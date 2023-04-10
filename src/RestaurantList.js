import React, {useContext, useEffect, useState} from 'react';
import RestaurantElement from "./RestaurantElement";
import './styles/RestaurantList.css';
import RestaurantContext from "./contexts/RestaurantContext";
import AddingRestaurantButton from "./AddingRestaurantButton";
import UserContext from "./contexts/UserContext";

function RestaurantList() {

    const {restaurants, images} = useContext(RestaurantContext);
    const {user} = useContext(UserContext);
    return (
        <div className="rests">
            {user != undefined && user !== "" && (user.role_name===process.env.REACT_APP_ADMIN_ROLE || user.role_name===process.env.REACT_APP_OWNER_ROLE) ? <AddingRestaurantButton/> : null}
            {restaurants.map((restaurant) => {
                return <RestaurantElement restaurant={restaurant} image={images[restaurant.r_id]}/>
            })}
        </div>
    );
}

export default RestaurantList;