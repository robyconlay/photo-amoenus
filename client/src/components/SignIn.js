import React, { useState } from 'react'
import LoginController from './LoginController'

import firebase from 'firebase/app'
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

import { auth } from './helper/firebase';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = () => {
        auth.signInWithEmailAndPassword(email, password).then(res => (
            console.log("Signing in")
        )).catch(err => console.log(err));
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
            <button onClick={signIn}>Sign In</button>
        </main>
    )
}


export default SignIn;