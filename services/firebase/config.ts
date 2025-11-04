import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD0YHKSP5hdVVl_n34TOqZ2yr8Nsg-qX9c",
  authDomain: "menuqr-ea239.firebaseapp.com",
  projectId: "menuqr-ea239",
  storageBucket: "menuqr-ea239.firebasestorage.app",
  messagingSenderId: "430028705581",
  appId: "1:430028705581:web:fd448c892081c45e150da4",
  measurementId: "G-1880L738R3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);