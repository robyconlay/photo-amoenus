import firebase from 'firebase'

firebase.initializeApp({
    apiKey: "AIzaSyCMJWk6B9IqIc68d-LZerkuZmypGfJSFrg",
    authDomain: "superchat-3d946.firebaseapp.com",
    projectId: "superchat-3d946",
    storageBucket: "superchat-3d946.appspot.com",
    messagingSenderId: "204017491221",
    appId: "1:204017491221:web:16875109adcda6bcf05d1c",
    measurementId: "G-M8D20FLRHK"
})

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();