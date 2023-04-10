import React, {useEffect} from 'react';
import './styles/RestaurantElement.css';
import {Link} from "react-router-dom";

function RestaurantElement(props) {

    return (
        <Link to={'/restaurant?id='+props.restaurant.r_id} className="rest">
            <div className="image">
                <img src={'/images/' + props.image} alt={""}/>
            </div>
            <div className="name-n-price">
                <div className="name">
                    <h3>
                        {props.restaurant.r_name}
                    </h3>
                </div>
                <div className="price">
                    <h3>
                        {props.restaurant.r_price}
                    </h3>
                </div>
            </div>
            <p>
                {props.restaurant.r_address}
            </p>
        </Link>
    );
}

export default RestaurantElement;