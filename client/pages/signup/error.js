export default function error() {
    return (
        <div id='center'>
            <h1>Errore!</h1>
            <form action='/signup'>
                <button className='registerbtn' type='submit'>Torna al signup</button>
            </form>
        </div>
    )
}