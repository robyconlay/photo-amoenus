export default function success() {
    return (
        <div id='center' className='popup'>
            <h1>Log in avvenuto con successo!</h1>
            <form action='/home'>
                <button className='registerbtn' type='submit'> Torna alla home page </button>
            </form>
        </div>
    )
}