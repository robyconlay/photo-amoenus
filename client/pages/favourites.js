import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'


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
export default function Favourites() {
	const [locations, setLocations] = useState([]);

	useEffect(() => {
		axios.get('/api/favourites')//fix
			.then(res => {
				const locations = res.data;
				setLocations(locations);
			});
	}, [])

	return (
		<>
			<Sidebar />
			<main>
				<div className="page">
					<List locations={locations} />
				</div>
			</main>
		</>
	)
}

export async function getStaticProps() { //cannot get at compile time?
	const req = await fetch(`http://localhost:8000/api/favourites/`);
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
