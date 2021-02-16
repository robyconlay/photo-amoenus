import React, { useState } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'


function FilterMenu() {
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [reachability, setReachability] = useState('');
    const [order, setOrder] = useState('');

    return (
        <div>
            <ul>
                <li className="filter">
                    <label>City</label>
                    <select onChange={setCity}>
                        <option value={null} selected>All</option>
                    </select>
                </li>
                <li className="filter">
                    <label>Category</label>
                    <select onChange={setCategory}>
                        <option value={null} selected>All</option>
                        <option value="landscape">Landscape</option>
                        <option value="urban">Urban</option>
                        <option value="monument">Monument</option>
                        <option value="lake">Lake</option>
                        <option value="sea">Sea</option>
                        <option value="mountain">Mountain</option>
                    </select>
                </li>
                <li className="filter">
                    <label>Order</label>
                    <select onChange={setOrder}>
                        <option value="name">A-Z</option>
                        <option value="-name">Z-A</option>
                        <option value="-date">Newest</option>
                        <option value="date">Oldest</option>
                    </select>
                </li>
                <li className="filter">
                    <label>Reachability</label>
                    <select onChange={setReachability}>
                        <option value={null} selected>All</option>
                    </select>
                </li>
            </ul>
        </div>
    )
}

function Location(props) {
    return (
        <li>
            <a href={`/locations/${props.data._id}`}>{`${props.data.name}, ${props.data.city}`}</a>
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

export default function Locations({ locations }) {
    console.log(locations);
    const [search, setSearch] = useState('');

    const filteredLocations = search.length === 0 ? locations
        : locations.filter(location => location.name.toLowerCase().includes(search.toLowerCase())
            || location.city.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <Sidebar />
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
            <div className="filter-container">
                <FilterMenu className="filter-menu" />
            </div>
        </div>
    )
}

export async function getStaticProps() {
    const req = await fetch(`http://localhost:8000/api/locations/`);
    const locations = await req.json();
    if (!locations) {
        return {
            notFound: true,
        }
    }
    return {
        props: { locations }
    }
}

