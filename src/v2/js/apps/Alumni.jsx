import React, {Fragment} from 'react';
import { forceCheck } from 'react-lazyload';

import _debounce from 'lodash-es/debounce';
import $ from 'jquery';

import FormSelect from 'components/FormSelect';
import UserCardList from 'components/UserCardList';
import {
    hideBodyPreloader,
    showBodyPreloader,
    showErrorNotification
} from "../utils";


// TODO: replace with HOC `UserCardFilter`
class Alumni extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            "loading": true,
            "items": [],
            ...props.init.state
        };
        this.fetch = _debounce(this.fetch, 300);
    }

    handleYearChange = (year) => {
        this.setState({
            year: year
        });
    };

    handleAreaChange = (areaCode) => {
        this.setState({
            area: areaCode
        });
    };

    handleCityChange = (city) => {
        this.setState({
            city: city
        });
    };

    componentDidMount = () => {
        const filterState = this.getFilterState(this.state);
        console.log("filterState", filterState);
        const newPayload = this.getRequestPayload(filterState);
        console.log("newPayload", newPayload);
        this.fetch(newPayload);
    };

    componentWillUnmount = function () {
        this.serverRequest.abort();
    };

    componentDidUpdate = (prevProps, prevState) => {
        if (this.state.loading) {
            const filterState = this.getFilterState(this.state);
            const newPayload = this.getRequestPayload(filterState);
            this.fetch(newPayload);
        } else {
            forceCheck();
            hideBodyPreloader();
        }
    };

    getFilterState(state) {
        let {year, city} = state;
        return {year, city};
    }

    getRequestPayload(filterState) {
        console.log(filterState);
        Object.keys(filterState).map((k) => {
            // Convert null and undefined to empty string
            filterState[k] = !filterState[k] ? "" : filterState[k];
        });
        return filterState;
    }

    fetch = (payload) => {
        console.log("fetch", this.props, payload);
        this.serverRequest = $.ajax({
            type: "GET",
            url: this.props.entry_url,
            dataType: "json",
            data: payload
        }).done((result) => {
            this.setState({
                loading: false,
                items: result.data,
            });
        }).fail(() => {
            showErrorNotification("Ошибка загрузки данных. Попробуйте перезагрузить страницу.");
        });

    };

    render() {
        if (this.state.loading) {
            showBodyPreloader();
        }
        //TODO: prevent rerendering if query < 3 symbols
        const {year, city, area} = this.state;
        const {years, cities, areas} = this.props;

        let filteredItems = this.state.items.filter(function(item) {
            let cityCondition = (city !== null) ? item.city === city.value : true;
            let areaCondition = (area !== null) ? item.areas.includes(area.value) : true;
            let yearCondition = (year !== null) ? item.year === year.value : true;
            return cityCondition && areaCondition && yearCondition;
        });

        return (
            <Fragment>
                <h1>Выпускники</h1>
                <div className="row mb-4">
                    <div className="col-lg-3">
                        <FormSelect
                            onChange={this.handleYearChange}
                            value={year}
                            name="year"
                            isClearable={false}
                            placeholder="Год выпуска"
                            options={years}
                            key="year"
                        />
                    </div>
                    <div className="col-lg-3">
                        <FormSelect
                            onChange={this.handleAreaChange}
                            value={area}
                            name="area"
                            placeholder="Направление"
                            isClearable={true}
                            options={areas}
                            key="area"
                        />
                    </div>
                    <div className="col-lg-3">
                        <FormSelect
                            onChange={this.handleCityChange}
                            value={city}
                            name="city"
                            isClearable={true}
                            placeholder="Город"
                            options={cities}
                            key="city"
                        />
                    </div>
                </div>
                <UserCardList users={filteredItems} />
            </Fragment>
        );
    }
}

export default Alumni;