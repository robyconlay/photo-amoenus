import React, { useState } from 'react'
import { auth } from './helper/firebase';
import firebase from 'firebase'

function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signUp = () => {
        auth.createUserWithEmailAndPassword(email, password).then(res => (
            console.log("Signing in")
        )).catch(err => console.log(err));
    }
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
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
export default SignUp;