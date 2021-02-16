export default function fail() {
    return (
        <div id='center'>
            <h1>Log in non riuscito!</h1>
            <form action='/login'>
                <button className='registerbtn' type='submit'>Torna al LogIn</button>
            </form>
        </div>
    )
}