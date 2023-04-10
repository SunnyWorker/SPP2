import React, {useContext} from 'react';
import styles from "../styles/AdminPanel.module.css";
import FilterContext from '../contexts/FilterContext';

function FilterButton(props) {

    const { filter, setFilter } = useContext(FilterContext);

    function filterToggleClickListener() {
        if(filter==="open") setFilter("close");
        else setFilter("open");
    }

    return (
        <div className={`${styles.filter}  ${styles.toggleDiv}`}>
            <button className={`${styles.filterToggle}  ${styles.toggle}`} onClick={filterToggleClickListener}>
                <img src="/images/filter.png" alt={""}/>
                    Фильтр
            </button>
        </div>
    );
}

export default FilterButton;