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
function Favourites() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    axios.get('/api/favourites')//fix
      .then(res => {
        const locations = res.data;
        setLocations(locations);
      });
  }, [])

  return (
    <main>
      <div className="page">
        <List locations={locations} />
      </div>
    </main>
  )
}

export default Favourites;