import { useState } from 'react'

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signUp = () => {
        fetch('http://localhost:8000/user/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                let mes = data.message;
                if (mes === "User created") {
                    // setCookie("token", data.token, 1);
                    // setCookie("uid", data.uid, 1);
                    window.location = 'login/success';
                } else if (mes === "Auth failed" || mes == "email not found") {
                    window.location = 'login/fail';
                } else {
                    window.location = 'login/error';
                }
            });
    }


    return (
        <main>
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.currentTarget.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.currentTarget.value)}
            />
            <button onClick={signUp}>Sign Up</button>
            <button onClick={signInWithGoogle}>
                Sign in with google
            </button>
        </main>
    )
}
