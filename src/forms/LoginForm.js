import React, {useContext, useEffect, useRef} from 'react';
import '../styles/RegistrationForm.css';
import Header from "../Header";
import {useNavigate} from "react-router-dom";
import {analyzeErrorReason, validateField} from "../Helpers";
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
    const {socket} = useContext(UserContext);

    useEffect(()=>{
        socket.on("set-cookie", (cookie) => {
            navigate("/main",{replace:true})
        });
    },[]);

    useEffect(()=>{
        socket.on("Errors", (errors) => {
            if(noCorrectDataErrorRef.current && alreadyAuthorizedErrorRef.current)
                analyzeErrorReason(errors,[noCorrectDataErrorRef, alreadyAuthorizedErrorRef], ["noCorrectDataError", "alreadyAuthorizedError"])
        });
    },[noCorrectDataErrorRef, alreadyAuthorizedErrorRef]);

    function handleClick() {
        try {
            const formData = new FormData(formRef.current);
            let correct = 0;
            correct += validateField(emailRef,formData.get('email'),"")
            correct += validateField(passwordRef,formData.get('password'),"")
            if (correct===0) {
                let req = {};
                req.email = formData.get('email');
                req.password = formData.get('password');
                socket.emit("login",req);
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