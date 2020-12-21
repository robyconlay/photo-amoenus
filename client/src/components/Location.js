import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Rating from 'react-rating'
import axios from 'axios'
import './Style.css'
import './Location.css'


function Location() {
    const [location, setLocation] = useState([]);
    const [image, setImage] = useState([]);
    const [type, setType] = useState('');
    const { id } = useParams();

    function toBase64(arr) {
        arr = new Uint8Array(arr);
        return btoa(
           arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
    }

    useEffect(() => {
        axios.get(`/api/locations/${id}`)
            .then(res => {
                const { location , file} = res.data;
                setLocation(location);
                setImage(toBase64(file.img.data.data));
                setType(file.img.data.type)
            })
    }, [])

    

    console.log(location, image, type);
    return (
        <main>
            <h1>
                {location.name}
            </h1>
            <h3>{location.address}, {location.city}</h3>
            <h3>{location.category}</h3>
            <img src={image} />
            <span>{location.description}</span>
            <span>{location.raggiungibilita}</span>
            <Rating
                emptySymbol="far fa-star fa-2x"
                fullSymbol="fa fa-star fa-2x"
            />
        </main>
    )
}

export default Location;