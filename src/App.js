import React, {useEffect, useState} from 'react';
import './styles/App.css';
import Main from "./Main";
import AddForm from "./AddForm";
import ChangeForm from "./ChangeForm";
import {Route, BrowserRouter, Routes} from "react-router-dom";
import RestaurantPage from "./RestaurantPage";

function App() {
        return (
            <BrowserRouter>
                <div className="container">
                    <Routes>
                        <Route path="/main" element={<Main/>}></Route>
                        <Route path="/add-rest" element={<AddForm/>}></Route>
                        <Route path="/change-rest" element={<ChangeForm/>}></Route>
                        <Route path="/restaurant" element={<RestaurantPage/>}/>
                    </Routes>
                </div>
            </BrowserRouter>
        );
}

export default App;