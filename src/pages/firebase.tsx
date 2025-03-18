import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//React앱의 경우 아래와 같이 getFirestore 메서드를 활용해 Cloud Firestore를 연동 가능하다.


const firebaseConfig = {
    apiKey: import.meta.env.VITE_APP_APIKEY,
    authDomain: import.meta.env.VITE_APP_AUTHDOMAIN,
    projectId: import.meta.env.VITE_APP_PROJECTID,
    storageBucket: import.meta.env.VITE_APP_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_APP_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APP_APPID
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };