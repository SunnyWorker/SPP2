import React, {useRef} from 'react';
import Header from "./Header";
import './styles/Form.css';
import axios from "axios";
import {useNavigate} from "react-router-dom";

function AddForm() {

    const formRef = useRef();
    const nameRef = useRef();
    const addressRef = useRef();
    const capacityRef = useRef();
    const priceRef = useRef();
    const imageRef = useRef();
    const nameErrorRef = useRef();
    const navigate = useNavigate();

    function handleClick() {
        try {
            const formData = new FormData(formRef.current);
            let correct = true;
            if (formData.get('name') === "") {
                nameRef.current.setCustomValidity("Необходимо ввести!");
                correct = false;
            } else nameRef.current.setCustomValidity("");
            if (formData.get('address') === "") {
                addressRef.current.setCustomValidity("Необходимо ввести!");
                correct = false;
            } else addressRef.current.setCustomValidity("");
            if (formData.get('capacity') === "") {
                capacityRef.current.setCustomValidity("Необходимо ввести!");
                correct = false;
            } else capacityRef.current.setCustomValidity("");
            if (formData.get('price') == undefined) {
                priceRef.current.style.color = "#CC0000";
                correct = false;
            } else priceRef.current.style.color = "black";
            if (formData.get('image').name === "") {
                imageRef.current.setCustomValidity("Необходимо ввести!");
                correct = false;
            } else {
                imageRef.current.setCustomValidity("");
            }
            if (correct) {

                const config = {
                    headers: {'content-type': 'multipart/form-data'}
                }

                axios.post("http://localhost:8080/add-rest", formData, config).then(response => {
                    console.log(1)
                    console.log(response)
                    navigate("/main",{replace: true});
                }).catch(reason => {
                    console.log(2)
                    console.log(reason.status)
                    console.log(reason)
                    if(reason.response.status===400) {
                        let body = reason.response.data;
                        if (body.errors.nameExistsError !== undefined) {
                            nameErrorRef.current.style.display = 'block';
                            nameErrorRef.current.textContent = body.errors.nameExistsError;
                        } else {
                            nameErrorRef.current.style.display = 'none';
                        }
                    }
                });

            }
        } catch (errors) {
            console.error(errors);
        }
    }

    return (
        <>
            <Header/>
            <form id="form" ref={formRef}>
                <label htmlFor="error" className="error" id="nameError" ref={nameErrorRef}></label>
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
        </>
    );
}

export default AddForm;