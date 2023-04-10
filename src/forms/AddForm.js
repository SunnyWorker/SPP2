import React, {useContext, useEffect, useRef, useState} from 'react';
import Header from "../Header";
import '../styles/Form.css';
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {analyzeErrorReason, validateField, validateRadioField} from '../Helpers';
import UserContext from "../contexts/UserContext";
import NoAuthorizedPart from "../NoAuthorizedPart";
import LoginButton from "../buttons/LoginButton";
import LogoutButton from "../buttons/LogoutButton";
import AbsolutePanel from "../buttons/AbsolutePanel";

function AddForm() {

    const formRef = useRef();
    const nameRef = useRef();
    const addressRef = useRef();
    const capacityRef = useRef();
    const priceRef = useRef();
    const imageRef = useRef();
    const {user, getUser} = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const nameExistsErrorRef = useRef();
    const navigate = useNavigate();

    useEffect(()=>{
        getUser();
    },[]);

    function handleClick() {
        try {
            const formData = new FormData(formRef.current);
            let correct = 0;
            correct += validateField(nameRef,formData.get('name'),"")
            correct += validateField(addressRef,formData.get('address'),"")
            correct += validateField(capacityRef,formData.get('capacity'),"")
            correct += validateRadioField(priceRef,formData.get('price'))
            correct += validateField(imageRef,formData.get('image'),"")

            if (correct===0) {

                const config = {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    withCredentials: true
                }

                axios.post("http://localhost:8080/add-rest", formData, config).then(response => {
                    navigate("/main",{replace: true});
                }).catch(reason => {
                    analyzeErrorReason(reason,[nameExistsErrorRef],["nameExistsError"])
                });

            }
        } catch (errors) {
            console.error(errors);
        }
    }

    useEffect(()=>{
        if(user!=undefined) setLoading(false)
    },[user]);

    if(loading) return (
        <Header/>
    );
    else if(user !== "" && (user.role_name===process.env.REACT_APP_ADMIN_ROLE || user.role_name===process.env.REACT_APP_OWNER_ROLE)) {
        return (
            <>
                <Header/>
                <form id="form" ref={formRef}>
                    <label htmlFor="error" className="error" id="nameExistsError" ref={nameExistsErrorRef}></label>
                    <label htmlFor="name">Имя ресторана:</label>
                    <input type="text" name="name" id="name" ref={nameRef}/>

                    <label htmlFor="address">Адрес:</label>
                    <input type="text" name="address" id="address" ref={addressRef}/>

                    <label htmlFor="capacity">Вместительность:</label>
                    <input type="number" name="capacity" id="capacity" min="1" ref={capacityRef}/>

                    <div className="price-options">
                        <label htmlFor="radio-label-name" ref={priceRef}>
                            <span className="radio-label-name" id="radio-label-name">Ценовая категория: </span>
                        </label>
                        <label htmlFor="$">
                            <input type="radio" id="$" name="price" value="$"/>
                            <span className="radio-label">$</span>
                        </label>
                        <label htmlFor="$$">
                            <input type="radio" id="$$" name="price" value="$$"/>
                            <span className="radio-label">$$</span>
                        </label>
                        <label htmlFor="$$$">
                            <input type="radio" id="$$$" name="price" value="$$$"/>
                            <span className="radio-label">$$$</span>
                        </label>
                        <label htmlFor="$$$$">
                            <input type="radio" id="$$$$" name="price" value="$$$$"/>
                            <span className="radio-label">$$$$</span>
                        </label>
                    </div>

                    <label htmlFor="description">Описание:</label>
                    <textarea name="description" id="description" form="form"></textarea>

                    <label htmlFor="image" ref={imageRef}>Картинка:</label>
                    <input type="file" name="image" id="image" accept=".gif,.jpg,.jpeg,.png,.bmp" ref={imageRef}/>
                    <button type="button" className={"agreeButton"} onClick={handleClick}>
                        Создать
                    </button>
                </form>
                <AbsolutePanel>
                    {user === "" ? <LoginButton/> : <LogoutButton/>}
                </AbsolutePanel>
            </>
        );
    }
    else if(user !== "" && user.role_name!==process.env.REACT_APP_ADMIN_ROLE && user.role_name!==process.env.REACT_APP_OWNER_ROLE) {
        return (
          <>
              <Header/>
              <NoAuthorizedPart message={"Вы не имеете права добавлять рестораны!"} advice={"И вы не можете это исправить!"}  href={"/main"} linkText={"В главное меню!"}/>
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

export default AddForm;