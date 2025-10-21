import React, { useContext, useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [anonymousUserName, setAnonymousUserName] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      const userObj = { uid: user.uid, email: user.email };
      setCurrentUser(userObj);
      setUserLoggedIn(true);

      // Fetch additional user data from Firestore
      const userDoc = doc(db, 'Users', user.uid);
      const userData = await getDoc(userDoc);
      
      if (userData.exists()) {
        setUserDetails(userData.data());
        
        // If the user is anonymous, set the anonymous user name
        if (userData.data().isAnonymous) {
          setAnonymousUserName(userData.data().name);
        }
      } else {
        setUserDetails(null);
      }
    } else {
      setCurrentUser(null);
      setUserDetails(null);
      setUserLoggedIn(false);
      setAnonymousUserName(null);
    }
    setLoading(false);
  }

  const value = {
    currentUser,
    userDetails,
    userLoggedIn,
    loading,
    anonymousUserName,
    setAnonymousUserName
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}