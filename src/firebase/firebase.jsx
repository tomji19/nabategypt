import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDZRumeK_FL8cpB1jcpOOa22YPz6Xhk5Sc',
  authDomain: 'nabat-egypt.firebaseapp.com',
  projectId: 'nabat-egypt',
  storageBucket: 'nabat-egypt.firebasestorage.app',
  messagingSenderId: '900119057098',
  appId: '1:900119057098:web:b2e8d612486109d2355a33',
  databaseURL:
    'https://console.firebase.google.com/project/nabat-egypt/firestore/databases/-default-/data',
};

const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, auth, db };
