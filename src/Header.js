import React from 'react';
import './styles/Header.css'
import {Link} from "react-router-dom";
function Header() {
    return (
        <div className="header">
            <Link to="/main">
                <h1>Рестораны Минска</h1>
            </Link>
        </div>
    );
}

export default Header;