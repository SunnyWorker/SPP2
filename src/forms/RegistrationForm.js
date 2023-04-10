import React, {useContext, useRef} from 'react';
import Header from "../Header";
import {useNavigate} from "react-router-dom";
import '../styles/RegistrationForm.css';
import {analyzeErrorReason, validateField, validateRadioField} from "../Helpers";
import axios from "axios";
import AbsolutePanel from "../buttons/AbsolutePanel";
import LoginButton from "../buttons/LoginButton";
import UserContext from "../contexts/UserContext";

function RegistrationForm(props) {

    const formRef = useRef();
    const nicknameRef = useRef();
    const surnameRef = useRef();
    const nameRef = useRef();
    const patronymicRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const sexRef = useRef();
    const roleRef = useRef();
    const confirmPasswordRef = useRef();
    const nicknameErrorRef = useRef();
    const passwordErrorRef = useRef();
    const emailErrorRef = useRef();
    const alreadyAuthorizedErrorRef = useRef();
    const navigate = useNavigate();
    const {user, getUser} = useContext(UserContext);

    function handleClick() {
        try {
            const formData = new FormData(formRef.current);
            let correct = 0;
            correct += validateField(nicknameRef,formData.get('nickname'),"");
            correct += validateField(surnameRef,formData.get('surname'),"");
            correct += validateField(nameRef,formData.get('name'),"");
            correct += validateField(emailRef,formData.get('email'),"");
            correct += validateField(passwordRef,formData.get('password'),"");
            correct += validateField(confirmPasswordRef,formData.get('confirmPassword'),"");
            correct += validateRadioField(sexRef,formData.get('sex'));
            correct += validateRadioField(roleRef,formData.get('role'));
            if(formData.get('confirmPassword')!==formData.get('password')) {
                passwordErrorRef.current.style.display = 'block';
                correct++;
            }
            else passwordErrorRef.current.style.display = 'none';

            if (correct===0) {

                const config = {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    withCredentials: true
                }

                axios.post("http://localhost:8080/registration", formData, config).then(response => {
                    navigate("/main",{replace: true});
                }).catch(reason => {
                    analyzeErrorReason(reason,
                        [nicknameErrorRef, emailErrorRef, alreadyAuthorizedErrorRef],
                        ["nicknameError", "emailError", "alreadyAuthorizedError"])
                });

            }
        } catch (errors) {
            console.error(errors);
        }
    }

    return (
        <>
            <Header/>
            <AbsolutePanel>
                <LoginButton/>
            </AbsolutePanel>
            <form id="form" ref={formRef}>
                <label htmlFor="error" className="error" id="nicknameError" ref={nicknameErrorRef}></label>
                <label htmlFor="error" className="error" id="alreadyAuthorizedError" ref={alreadyAuthorizedErrorRef}></label>

                <label htmlFor="nickname">Псевдоним:</label>
                <input type="text" name="nickname" id="name" ref={nicknameRef}/>

                <label htmlFor="surname">Фамилия:</label>
                <input type="text" name="surname" id="surname" ref={surnameRef}/>

                <label htmlFor="name">Имя:</label>
                <input type="text" name="name" id="name" ref={nameRef}/>

                <label htmlFor="patronymic">Отчество:</label>
                <input type="text" name="patronymic" id="patronymic" ref={patronymicRef}/>

                <label htmlFor="error" className="error" id="emailErrorRef" ref={emailErrorRef}></label>
                <label htmlFor="email">Адрес элекронной почты:</label>
                <input type="text" name="email" id="email" ref={emailRef}/>

                <label htmlFor="password">Пароль:</label>
                <input type="password" name="password" id="password" ref={passwordRef}/>

                <label htmlFor="error" className="error" id="passwordErrorRef" ref={passwordErrorRef}>Пароли не совпадают!</label>
                <label htmlFor="confirmPassword">Подтверждение пароля:</label>
                <input type="password" name="confirmPassword" id="confirmPassword" ref={confirmPasswordRef}/>


                <div className="sex options">
                    <label htmlFor="radio-label-name" ref={sexRef}>
                        <span className="radio-label-name" id="radio-label-name">Пол: </span>
                    </label>
                    <label htmlFor="Male">
                        <input type="radio" id="Male" name="sex" value="Male"/>
                        <span className="radio-label">Мужчина</span>
                    </label>
                    <label htmlFor="Female">
                        <input type="radio" id="Female" name="sex" value="Female"/>
                        <span className="radio-label">Женщина</span>
                    </label>
                    <label htmlFor="Sok">
                        <input type="radio" id="Sok" name="sex" value="Sok"/>
                        <span className="radio-label">Fanta Виноград</span>
                    </label>
                </div>

                <div className="role options">
                    <label htmlFor="radio-label-name" ref={roleRef}>
                        <span className="radio-label-name" id="radio-label-name">Вы: </span>
                    </label>
                    <label htmlFor="user">
                        <input type="radio" id="user" name="role" value="1"/>
                        <span className="radio-label">Посетитель</span>
                    </label>
                    <label htmlFor="owner">
                        <input type="radio" id="owner" name="role" value="2"/>
                        <span className="radio-label">Владелец ресторана</span>
                    </label>
                </div>

                <label htmlFor="image">Картинка:</label>
                <input type="file" name="image" id="image" accept=".gif,.jpg,.jpeg,.png,.bmp"/>
                <button type="button" className={"agreeButton"} onClick={handleClick}>
                    Зарегистрироваться
                </button>
            </form>
        </>
    );
}

export default RegistrationForm;