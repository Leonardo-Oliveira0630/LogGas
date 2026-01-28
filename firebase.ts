
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração padrão do Firebase. 
// Em um ambiente de produção real, estas chaves viriam de variáveis de ambiente.
const firebaseConfig = {
  apiKey: "AIzaSyBl1XUanV-pBiSXDQI19uJw-9LlBPZFuI0",
  authDomain: "loggas-2254a.firebaseapp.com",
  projectId: "loggas-2254a",
  storageBucket: "loggas-2254a.firebasestorage.app",
  messagingSenderId: "434496716754",
  appId: "1:434496716754:web:06bfa066b583c92fd8920b",
  measurementId: "G-0D015FD53Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
