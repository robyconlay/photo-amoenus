import { useRouter } from 'next/router'
//import Rating from 'react-rating'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'


export default function Location({ location }) {

    const router = useRouter();
    const { id } = router.query;
    const props = location.location;
    /*
        function toBase64(arr) {
            arr = new Uint8Array(arr);
            return btoa(
                arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
        }*/
    console.log(location);
    return (
        <>
            <Sidebar />
            <main>
                <h1>
                    {props.name}
                </h1>
                <h3>{props.address}, {props.city}</h3>
                <h3>{props.category}</h3>
                {//<img src={image} />
                }
                <span>{props.description}</span><br />
                <span>{props.raggiungibilita}</span>
                {/*
            <Rating
                emptySymbol="far fa-star fa-2x"
                fullSymbol="fa fa-star fa-2x"
            />*/}
            </main>
        </>
    )
}

export async function getStaticProps({ params }) {
    const req = await fetch(`http://localhost:8000/api/locations/${params.id}`);
    const location = await req.json();
    return {
        props: { location }
    }
}

export async function getStaticPaths() {
    const req = await fetch(`http://localhost:8000/api/locations`);
    const data = await req.json();

    const paths = data.map(location => `/locations/${location._id}`)
    //console.log(paths);

    return {
        paths,
        fallback: false
    };
}