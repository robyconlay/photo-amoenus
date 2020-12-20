import React from 'react'
import axios from 'axios'

function Location(props) {
    console.log("props: " + props);
    return (
        <li>
            <a href={`/locations/${props.id}`}>{props.name}</a>
        </li>
    )
}

function Locations(props) {
    console.log(props);
    return props.locations.map((location) => <Location data={location} />)
}


class LocationsPage extends React.Component {
    state = {
        locations: []
    }

    componentDidMount() {
        axios.get('/api/locations')
            .then(res => this.setState({ locations: res.data }))
            .catch(err => console.log(err));
    }

    render() {


        return (
            <main>
                <Locations data={this.state.locations} />
            </main>
        )
    }
}

export default LocationsPage;