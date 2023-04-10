import React, {useEffect, useState} from 'react';
import './styles/App.css';
import Main from "./Main";
import AddForm from "./forms/AddForm";
import ChangeForm from "./forms/ChangeForm";
import {Route, BrowserRouter, Routes} from "react-router-dom";
import RestaurantPage from "./RestaurantPage";
import RegistrationForm from "./forms/RegistrationForm";
import LoginForm from "./forms/LoginForm";
import UserContext from "./contexts/UserContext";
import axios from "axios";

function App() {
    const [user, setUser] = useState();
    const config = {
        withCredentials: true
    }

    const getUser = () => {
        axios.get("http://localhost:8080/getUserInfo",config)
            .then(response => {
                setUser(response.data.user);
            }).catch(reason => {
                setUser("");
        });
    }

        return (
            <UserContext.Provider value={{ user, getUser}}>
                <BrowserRouter>
                    <div className="container">
                        <Routes>
                            <Route path="/main" element={<Main/>}></Route>
                            <Route path="/add-rest" element={<AddForm/>}></Route>
                            <Route path="/change-rest" element={<ChangeForm/>}></Route>
                            <Route path="/restaurant" element={<RestaurantPage/>}/>
                            <Route path="/registration" element={<RegistrationForm/>}/>
                            <Route path="/login" element={<LoginForm/>}/>
                        </Routes>
                    </div>
                </BrowserRouter>
            </UserContext.Provider>
        );
}

export default App;