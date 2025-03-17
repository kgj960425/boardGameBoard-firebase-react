// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// import { getFunctions } from "firebase/functions";
// import { getMessaging } from "firebase/messaging";
// import { getPerformance } from "firebase/performance";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: pro,
//   authDomain: process.env.REACT_APP_AUTHDOMAIN,
//   projectId: process.env.REACT_APP_PROJECTID,
//   storageBucket: process.env.REACT_APP_STORAGEBUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
//   appId: process.env.REACT_APP_APPID
// };

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