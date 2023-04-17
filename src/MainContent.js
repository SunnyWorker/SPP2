import Header from "./Header";
import RestaurantList from "./RestaurantList";
import './styles/MainContent.css';
import FilterContext from './contexts/FilterContext';
import React, {useContext, useEffect, useRef} from "react";
import UserContext from "./contexts/UserContext";
import NoAuthorizedPart from "./NoAuthorizedPart";

function MainContent() {

    const {user} = useContext(UserContext);
    const { filter, setFilter } = useContext(FilterContext);
    const mainRef = useRef();

    useEffect(()=>{
        if(filter==="open" || filter==="close") mainRef.current.classList.toggle('open');
    })

    function closeFilter() {
        if(filter==="open") setFilter("close");
    }
    return (
      <div ref={mainRef} className="main" onClick={closeFilter}>
          <Header/>
          {user === "" ? <NoAuthorizedPart message={"Вы не авторизованы!"} advice={"Но вы всегда можете это исправить!"} href={"/login"} linkText={"Войти"}/> : <RestaurantList/>}
      </div>
    );
}

export default MainContent;
