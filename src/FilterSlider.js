import React, {useContext, useEffect, useRef} from 'react';
import './styles/FilterSlider.css';
import FilterContext from './contexts/FilterContext';

function FilterSlider() {

    const { filter } = useContext(FilterContext);
    const sliderRef = useRef();

    useEffect(()=>{
        if(filter==="open" || filter==="close") sliderRef.current.classList.toggle('open');
    })

    return (
        <div ref={sliderRef} className="filter-sidebar">
            <form>
                <div className="form-group">
                    <label htmlFor="name">Название:</label>
                    <input type="text" id="name" name="name"/>
                </div>
                <div className="form-group">
                    <label htmlFor="p-name">Цена:</label>
                    <div className="checkboxes">
                        <div>
                            <input type="radio" id="price1" name="price" value="$"/>
                            <label htmlFor="price1">$</label>
                        </div>
                        <div>
                            <input type="radio" id="price2" name="price" value="$$"/>
                            <label htmlFor="price2">$$</label>
                        </div>
                        <div>
                            <input type="radio" id="price3" name="price" value="$$$"/>
                            <label htmlFor="price3">$$$</label>
                        </div>
                        <div>
                            <input type="radio" id="price4" name="price" value="$$$$"/>
                            <label htmlFor="price4">$$$$</label>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="capacityFrom">Мин. вместительность:</label>
                    <input type="number" id="capacityFrom" name="capacityFrom" min="1"/>
                </div>
                <div className="form-group">
                    <label htmlFor="capacityTo">Макс. вместительность:</label>
                    <input type="number" id="capacityTo" name="capacityTo" min="1"/>
                </div>
                <div className="form-group">
                    <button className={"filterButton"} type="submit">Применить</button>
                </div>
            </form>
        </div>
    );
}

export default FilterSlider;