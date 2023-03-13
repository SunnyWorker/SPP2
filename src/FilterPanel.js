import React, {useContext} from 'react';
import './styles/FilterPanel.css';
import FilterContext from './FilterContext';

function FilterPanel(props) {

    const { filter, setFilter } = useContext(FilterContext);

    function filterToggleClickListener() {
        if(filter==="open") setFilter("close");
        else setFilter("open");
        console.log("OK!")
    }

    return (
        <div className="absolute-panel">
            <div className="filter-toggle-div">
                <button className="filter-toggle" onClick={filterToggleClickListener}>
                    <img src="/images/filter.png" alt={""}/>
                        Фильтр
                </button>
            </div>
        </div>
    );
}

export default FilterPanel;