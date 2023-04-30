import {initializeApp} from 'firebase/app'
import {getFirestore} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyC1sfxhtBiUhuA_Ltn6R3Ix8R-TxY-ZWVI',
  authDomain: 'app-cadastros.firebaseapp.com',
  projectId: 'app-cadastros',
  storageBucket: 'app-cadastros.appspot.com',
  messagingSenderId: '918969412396',
  appId: '1:918969412396:web:b33183f8c7ad8106b05a89'
}

const firebaseApp = initializeApp(firebaseConfig)

const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)

export {db, auth}
