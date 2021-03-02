const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {
    apiKey: "AIzaSyDr7y5Xy0DekirsCU1i_d4QIrtnllgQKmE",
    authDomain: "kiei-451-a5ba9.firebaseapp.com",
    projectId: "kiei-451-a5ba9",
    storageBucket: "kiei-451-a5ba9.appspot.com",
    messagingSenderId: "296217260745",
    appId: "1:296217260745:web:43effe96466ba33af75318"
} // updated to Dara's firebase config

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase