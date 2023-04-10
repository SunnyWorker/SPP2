import React, {useContext, useRef} from 'react';
import '../styles/RegistrationForm.css';
import Header from "../Header";
import {useNavigate} from "react-router-dom";
import {analyzeErrorReason, validateField} from "../Helpers";
import axios from "axios";
import AbsolutePanel from "../buttons/AbsolutePanel";
import RegistrationButton from "../buttons/RegistrationButton";
import UserContext from "../contexts/UserContext";
function LoginForm(props) {

    const formRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const noCorrectDataErrorRef = useRef();
    const alreadyAuthorizedErrorRef = useRef();
    const navigate = useNavigate();
    const {user, getUser} = useContext(UserContext);

    function handleClick() {
        try {
            const formData = new FormData(formRef.current);
            let correct = 0;
            correct += validateField(emailRef,formData.get('email'),"")
            correct += validateField(passwordRef,formData.get('password'),"")
            if (correct===0) {
                const config = {
                    headers: {'content-type': 'multipart/form-data'},
                    withCredentials: true
                }
                axios.post("http://localhost:8080/login", formData, config).then(response => {
                    navigate("/main",{replace: true});
                }).catch(reason => {
                    analyzeErrorReason(reason,[noCorrectDataErrorRef, alreadyAuthorizedErrorRef], ["noCorrectDataError", "alreadyAuthorizedError"])
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
                <RegistrationButton/>
            </AbsolutePanel>
            <form id="form" ref={formRef}>
                <label htmlFor="error" className="error" id="noCorrectDataError" ref={noCorrectDataErrorRef}></label>
                <label htmlFor="error" className="error" id="alreadyAuthorizedError" ref={alreadyAuthorizedErrorRef}></label>

                <label htmlFor="email">Адрес элекронной почты:</label>
                <input type="text" name="email" id="email" ref={emailRef}/>

                <label htmlFor="password">Пароль:</label>
                <input type="password" name="password" id="password" ref={passwordRef}/>

                <button type="button" className={"agreeButton"} onClick={handleClick}>
                    Войти
                </button>
            </form>
        </>
    );
}

export default LoginForm;