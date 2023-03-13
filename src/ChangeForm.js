import React, {useEffect, useRef, useState} from 'react';
import Header from "./Header";
import './styles/Form.css';
import {useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";

function ChangeForm() {

    const [searchParams] = useSearchParams();
    const [restaurant, setRestaurant] = useState();
    const [images, setImages] = useState();
    const formRef = useRef();
    const nameRef = useRef();
    const addressRef = useRef();
    const capacityRef = useRef();
    const priceRef = useRef();
    const nameErrorRef = useRef();
    const navigate = useNavigate();

    useEffect(()=>{
        axios.get("http://localhost:8080/getRestaurantById?id="+searchParams.get("id"))
            .then(response => {
                setRestaurant(response.data.restaurant);
            });

        axios.get("http://localhost:8080/getImages?id="+searchParams.get("id"))
            .then(response => {
                setImages(response.data.images);
            });

    },[searchParams]);

    function handleClick() {
        try {
            const formData = new FormData(formRef.current);
            let correct = true;
            if(formData.get('name')==="") {
                nameRef.current.setCustomValidity("Необходимо ввести!");
                correct = false;
            }
            else nameRef.current.setCustomValidity("");
            if(formData.get('address')==="") {
                addressRef.current.setCustomValidity("Необходимо ввести!");
                correct = false;
            }
            else addressRef.current.setCustomValidity("");
            if(formData.get('capacity')==="") {
                capacityRef.current.setCustomValidity("Необходимо ввести!");
                correct = false;
            }
            else capacityRef.current.setCustomValidity("");
            if(formData.get('price')===undefined) {
                priceRef.current.style.color = "#CC0000";
                correct = false;
            }
            else priceRef.current.style.color = "black";
            if(correct) {

                const config = {
                    headers: { 'content-type': 'multipart/form-data' }
                }

                axios.put("http://localhost:8080/change-rest?id="+restaurant.r_id,formData, config).then((response)=>{
                    navigate('/restaurant?id=' + restaurant.r_id,{replace: true});
                }).catch(reason=>{
                    console.log(reason.response);
                    if(reason.response.status===400) {
                        let body = reason.response.data;
                        if (body.errors.nameExistsError !== undefined) {
                            nameErrorRef.current.style.display = 'block';
                            nameErrorRef.current.textContent = body.errors.nameExistsError;
                        } else {
                            nameErrorRef.current.style.display = 'none';
                        }
                    }
                })
            }
        } catch (errors) {
            console.error(errors);
        }
    }

    if(restaurant && images) {
        return (
            <>
                <Header/>
                <form id="form" ref={formRef}>
                    <label htmlFor="error" className="error" id="nameError" ref={nameErrorRef}></label>
                    <label htmlFor="name">Имя ресторана:</label>
                    <input type="text" name="name" id="name" ref={nameRef} defaultValue={restaurant.r_name}/>

                    <label htmlFor="address">Адрес:</label>
                    <input type="text" name="address" id="address" ref={addressRef} defaultValue={restaurant.r_address}/>

                    <label htmlFor="capacity">Вместительность:</label>
                    <input type="number" name="capacity" id="capacity" ref={capacityRef} min="1" defaultValue={restaurant.r_capacity}/>

                    <div className="price-options">
                        <label ref={priceRef} htmlFor="radio-label-name">
                            <span className="radio-label-name" id="radio-label-name">Ценовая категория: </span>
                        </label>
                        <label htmlFor="$">
                            <input type="radio" id="$" name="price" value="$"  defaultChecked={restaurant.r_price==="$"}/>
                            <span className="radio-label">$</span>
                        </label>
                        <label htmlFor="$$">
                            <input type="radio" id="$$" name="price" value="$$" defaultChecked={restaurant.r_price==="$$"}/>
                            <span className="radio-label">$$</span>
                        </label>
                        <label htmlFor="$$$">
                            <input type="radio" id="$$$" name="price" value="$$$" defaultChecked={restaurant.r_price==="$$$"}/>
                            <span className="radio-label">$$$</span>
                        </label>
                        <label htmlFor="$$$$">
                            <input type="radio" id="$$$$" name="price" value="$$$$" defaultChecked={restaurant.r_price==="$$$$"}/>
                            <span className="radio-label">$$$$</span>
                        </label>
                    </div>

                    <label  htmlFor="description">Описание:</label>
                    <textarea name="description" id="description" form="form" defaultValue={restaurant.r_description}></textarea>

                    <label htmlFor="image">Картинка:</label>
                    <input type="file" name="image" id="image" accept=".gif,.jpg,.jpeg,.png,.bmp"/>
                    <button type="button" className={"agreeButton"} onClick={handleClick}>
                        Изменить
                    </button>
                </form>
            </>
        );
    }
}

export default ChangeForm;