import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
  getAuth,
  signInAnonymously,
} from 'firebase/auth';
import { auth } from './firebase';
import { GoogleAuthProvider } from 'firebase/auth/web-extension';

const auth = getAuth();

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// SignIn with Email and Password
export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// SignIn with Google
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

// SignOut
export const doSignOut = () => {
  return auth.signOut();
};

// Password Reset
// Used when a user has forgotten their password and needs to reset it
// Requires only the user's email address
// Sends a reset link to the user's email
// User doesn't need to be currently logged in
// Example use case: "Forgot Password" feature
export const DoPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Password Change
// Used when a user wants to change their password while logged in
// Requires the user to be currently authenticated (auth.currentUser)
// Changes the password directly without email verification
// Example use case: "Change Password" in user settings
export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

// Send Verification
export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};

// SignIn Anonymously
export const doSignInAnonymously = async () => {
  const result = await signInAnonymously(auth);
  return result;
};