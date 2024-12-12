import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Firebase Config
export const firebaseConfig = {
  apiKey: "AIzaSyAh7dZK3Hwak6rxick64aGFQPYNshT-Qno",
  authDomain: "omniplex-9b722.firebaseapp.com",
  projectId: "omniplex-9b722",
  storageBucket: "omniplex-9b722.firebasestorage.app",
  messagingSenderId: "629919213751",
  appId: "1:629919213751:web:07d928f55ba354dab5c532",
  measurementId: "G-9KMVC53NNX"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

export const initializeFirebase = () => {
  return app;
};
