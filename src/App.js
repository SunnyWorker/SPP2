import React, {useEffect, useState} from 'react';
import './styles/App.css';
import Main from "./Main";
import AddForm from "./forms/AddForm";
import ChangeForm from "./forms/ChangeForm";
import {Route, BrowserRouter, Routes, useNavigate} from "react-router-dom";
import RestaurantPage from "./RestaurantPage";
import RegistrationForm from "./forms/RegistrationForm";
import LoginForm from "./forms/LoginForm";
import UserContext from "./contexts/UserContext";
import axios from "axios";
import io from 'socket.io-client';
import {CookiesProvider, useCookies} from 'react-cookie';

function App() {
    const [user, setUser] = useState();
    const [socket, setSocket] = useState(io('http://localhost:3001', {
        withCredentials: true
    }));
    const [cookies, setCookie, clearCookie] = useCookies(['JWT']);

    const getUser = () => {
        let req = {};
        req.cookies = cookies;
        socket.emit('getUserInfo',req);
    }

    useEffect(()=>{
        socket.on('getUserInfo', (user) => {
            setUser(user);
        });

        socket.on('set-cookie', (cookieHeader) => {
            setCookie(cookieHeader.name,cookieHeader.value,cookieHeader.options);
        });

        socket.on("clear-cookie", (cookie) => {
            console.log(cookie)
            clearCookie(cookie);
        });
    },[]);

    useEffect(()=>{
        getUser();
    },[cookies]);

        return (
            <CookiesProvider>
                <UserContext.Provider value={{ user, getUser, socket}}>
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
            </CookiesProvider>
        );
}

export default App;