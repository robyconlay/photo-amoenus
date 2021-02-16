import { useState } from 'react'

// function setCookie(name, value, hours) {
//     var expires = "";
//     if (hours) {
//         var date = new Date();
//         date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
//         expires = "; expires=" + date.toUTCString();
//     }
//     document.cookie = name + "=" + (value || "") + expires + "; path=/";
// }

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signin = () => {
        if (email == '') {
            console.log("email is empty");
        } else if (password == '') {
            console.log("password is empty")
        } else {
            fetch('http://localhost:8000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data)
                    let mes = data.message;
                    if (mes === "Auth successful") {
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
            <button onClick={signin}>Sign In</button>
        </main>
    )
}