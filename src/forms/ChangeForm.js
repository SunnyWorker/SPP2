import React, {useContext, useEffect, useRef, useState} from 'react';
import Header from "../Header";
import '../styles/Form.css';
import {useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";
import {analyzeErrorReason, validateField, validateRadioField} from "../Helpers";
import Cookies from 'js-cookie';
import UserContext from "../contexts/UserContext";
import NoAuthorizedPart from "../NoAuthorizedPart";
import ChangeButton from "../buttons/ChangeButton";
import DeleteButton from "../buttons/DeleteButton";
import LoginButton from "../buttons/LoginButton";
import LogoutButton from "../buttons/LogoutButton";
import AbsolutePanel from "../buttons/AbsolutePanel";

function ChangeForm() {

    const [searchParams] = useSearchParams();
    const [restaurant, setRestaurant] = useState();
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState();
    const formRef = useRef();
    const nameRef = useRef();
    const addressRef = useRef();
    const capacityRef = useRef();
    const priceRef = useRef();
    const nameExistsErrorRef = useRef();
    const navigate = useNavigate();
    const {user, getUser} = useContext(UserContext);

    useEffect(()=>{
        const config = {
            withCredentials: true
        }
        axios.get("http://localhost:8080/getRestaurantById?id="+searchParams.get("id"), config)
            .then(response => {
                setRestaurant(response.data.restaurant);
            }).catch(reason => setRestaurant(""));

        axios.get("http://localhost:8080/getImages?id="+searchParams.get("id"), config)
            .then(response => {
                setImages(response.data.images);
            }).catch(reason => setImages(""));
        getUser();
    },[searchParams]);

    function handleClick() {
        try {
            const formData = new FormData(formRef.current);
            let correct = 0;
            correct += validateField(nameRef,formData.get('name'),"")
            correct += validateField(addressRef,formData.get('address'),"")
            correct += validateField(capacityRef,formData.get('capacity'),"")
            correct += validateRadioField(priceRef,formData.get('price'))

            if(correct===0) {
                const config = {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
                axios.put("http://localhost:8080/change-rest?id="+restaurant.r_id,formData, config).then((response)=>{
                    navigate('/restaurant?id=' + restaurant.r_id,{replace: true});
                }).catch(reason=>{
                    analyzeErrorReason(reason,[nameExistsErrorRef], "nameExistsError")
                })
            }
        } catch (errors) {
            console.error(errors);
        }
    }

    useEffect(()=>{
        if(restaurant!=undefined && images!=undefined && user!=undefined) setLoading(false)
    },[restaurant , images , user]);

    if(loading) return (
        <Header/>
    );
    else if(user !== "" && (user.role_name===process.env.REACT_APP_ADMIN_ROLE || user.u_id===restaurant.r_owner_id)) {
        return (
            <>
                <Header/>
                <form id="form" ref={formRef}>
                    <label htmlFor="error" className="error" id="nameExistsError" ref={nameExistsErrorRef}></label>
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
                <AbsolutePanel>
                    {user === "" ? <LoginButton/> : <LogoutButton/>}
                </AbsolutePanel>
            </>
        );
    }
    else if(user !== "" && user.role_name!==process.env.REACT_APP_ADMIN_ROLE && user.u_id!==restaurant.r_owner_id) {
        return (
            <>
                <Header/>
                <NoAuthorizedPart message={"Вы не имеете права изменять информацию об этом ресторане!"} advice={"И вы не можете это исправить!"}  href={"/main"} linkText={"В главное меню!"}/>
            </>
        );
    }
    else if(user==="") {
        return (
            <>
                <Header/>
                <NoAuthorizedPart message={"Вы не имеете доступ к этой части сайта, если вы не владелец данного ресторана!"}  advice={"Но вы всегда можете это исправить!"}  href={"/login"} linkText={"Войти"}/>
            </>
        );
    }
}

export default ChangeForm;