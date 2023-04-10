import React from 'react';
import './styles/RestaurantList.css';
import {Link} from "react-router-dom";

function AddingRestaurantButton(props) {
    return (
        <Link to="/add-rest" className="rest rest-add">
            <img src={"/images/plus.png"} alt={""}/>
        </Link>
    );
}

export default AddingRestaurantButton;