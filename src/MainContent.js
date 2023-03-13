import Header from "./Header";
import RestaurantList from "./RestaurantList";
import './styles/MainContent.css';
import FilterContext from './FilterContext';
import {useContext, useEffect, useRef} from "react";

function MainContent() {

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
          <RestaurantList/>
      </div>
    );
}

export default MainContent;
