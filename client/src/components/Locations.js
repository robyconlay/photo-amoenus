import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Style.css'
import './Locations.css'

function Location(props) {
    return (
        <li>
            <a href={`/location/${props.data._id}`}>{`${props.data.name}, ${props.data.city}`}</a>
        </li>
    )
}

function List({ locations }) {
    return (
        <div className="locations-list">
            <ul>
                {locations.map(location => {
                    return <Location
                        key={location._id}
                        data={location} />
                })}
            </ul>
        </div>
    )
}

function Locations() {
    const [locations, setLocations] = useState([]);
    const [search, setSearch] = useState('');


    useEffect(() => {
        axios.get('/api/locations')
            .then(res => {
                const locations = res.data;
                setLocations(locations);
            });
    }, [])

    const filteredLocations = search.length === 0 ? locations
        : locations.filter(location => location.name.toLowerCase().includes(search.toLowerCase())
            || location.city.toLowerCase().includes(search.toLowerCase()));

    return (
        <main>
            <div className="page">
                <div className="search-div">
                    <input
                        className="searchbar"
                        type="text"
                        placeholder="search location"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <List locations={filteredLocations} />
            </div>
        </main>
    )
}

export default Locations;