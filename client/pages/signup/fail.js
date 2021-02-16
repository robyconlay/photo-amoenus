export default function fail() {
    return (
        <div id='center'>
            <h1>Log in non riuscito!</h1>
            <form action='/signup'>
                <button className='registerbtn' type='submit'>Torna al signup</button>
            </form>
        </div>
    )
}