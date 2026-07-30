// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================
// This file contains reusable functions for user authentication
// Each function handles a specific auth operation (sign up, sign in, etc.)

import { supabase } from './supabase';

// ============================================
// FUNCTION 1: Create User with Email and Password
// ============================================
// This function registers a new user with Supabase Auth
// It also includes optional metadata (like name) that gets stored with the user
// STEP 1: Why metadata?
// - Supabase auth.users table has limited fields (id, email, etc.)
// - user_metadata allows us to store extra info directly with the auth user
// - This metadata is then used by our database trigger to populate the 'profiles' table
// STEP 2: Why emailRedirectTo?
// - After signup, Supabase sends a confirmation email
// - When the user clicks the link, they are redirected to this URL
// - We add `?confirmed=true` to the URL to show a success message on the login page
export const doCreateUserWithEmailAndPassword = async (email, password, metadata = {}) => {
  // STEP 3: Call Supabase's signUp method
  // This is an async operation - we use await to wait for it to complete
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullname: metadata.fullname || metadata.name || '', // Store full name
        name: metadata.name || metadata.fullname || '',     // Store display name
      },
      emailRedirectTo: `${window.location.origin}/login?confirmed=true`, // Redirect after email confirmation
    },
  });
  
  // STEP 4: Error handling
  // If Supabase returns an error, we throw it to be caught by the calling component
  if (error) throw error;
  
  // STEP 5: Return the data
  // data contains user info, session info, etc.
  // The calling component can use this to update UI or navigate
  return data;
};

// ============================================
// FUNCTION 2: Sign In with Email and Password
// ============================================
// This function authenticates an existing user
export const doSignInWithEmailAndPassword = async (email, password) => {
  // STEP 1: Call Supabase's signInWithPassword method
  // This is an async operation - we use await to wait for it to complete
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  // STEP 2: Error handling
  if (error) throw error;
  
  // STEP 3: Return the data
  // data contains user info, session info, etc.
  return data;
};

// ============================================
// FUNCTION 3: Sign In with Google (OAuth)
// ============================================
// This function initiates the Google OAuth flow
// Supabase handles the redirect to Google and back to our app
export const doSignInWithGoogle = async () => {
  // STEP 1: Call Supabase's signInWithOAuth method
  // provider: 'google' specifies which OAuth provider to use
  // redirectTo: URL where Google will send the user back after authentication
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/home`, // Redirect to home page after Google login
    },
  });
  
  // STEP 2: Error handling
  if (error) throw error;
  
  // STEP 3: Return data
  // Note: OAuth redirects the page, so this might not execute immediately
  return data;
};

// ============================================
// FUNCTION 4: Sign Out User
// ============================================
// This logs the user out by destroying their session
// STEP 1: Understanding signOut()
// supabase.auth.signOut() does several things:
// - Destroys the session on Supabase server
// - Clears session from browser's local storage (automatically)
// - Triggers onAuthStateChange event with null session (which AuthContext listens to)
// - Returns { error } if something goes wrong
export const doSignOut = async () => {
  // STEP 2: Call Supabase's signOut method
  // This is an async operation - we use await to wait for it to complete
  // signOut() clears the session and triggers onAuthStateChange automatically
  // The AuthContext's listener will detect session is null and update state
  const { error } = await supabase.auth.signOut();
  
  // STEP 3: Handle errors
  // If signOut fails (network issues, etc.), we throw the error
  // The calling component can catch it and still clear local data
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
  
  // STEP 4: Verify session is cleared
  // Double-check that the session is actually gone
  // This helps debug if logout isn't working
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.warn('Warning: Session still exists after signOut');
  } else {
    console.log('Session cleared successfully after signOut.');
  }
  
  // No return value needed - user is just logged out
};

// ============================================
// FUNCTION 5: Password Reset
// ============================================
// Sends a password reset email to the user
export const DoPasswordReset = async (email) => {
  // STEP 1: Call Supabase's resetPasswordForEmail method
  // redirectTo: URL where the user will be sent after clicking the reset link
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`, // Redirect to a specific page for password reset
  });
  
  // STEP 2: Error handling
  if (error) throw error;
  
  // STEP 3: Return data
  return data;
};

// ============================================
// FUNCTION 6: Password Change (for authenticated users)
// ============================================
// Updates the password for the currently logged-in user
export const doPasswordChange = async (newPassword) => {
  // STEP 1: Call Supabase's updateUser method
  // This updates the user's profile in Supabase Auth
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  // STEP 2: Error handling
  if (error) throw error;
  
  // STEP 3: Return data
  return data;
};

// ============================================
// FUNCTION 7: Send Email Verification
// ============================================
// Resends the email verification link to the current user
export const doSendEmailVerification = async () => {
  // STEP 1: Get current user
  // We need the user's email to resend the verification
  const { data: { user } } = await supabase.auth.getUser();
  // If no user is logged in, throw an error
  if (!user) throw new Error('No user logged in');
  
  // STEP 2: Call Supabase's resend method
  // type: 'signup' specifies we are resending a signup confirmation email
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
  });
  
  // STEP 3: Error handling
  if (error) throw error;
  
  // STEP 4: Return data
  return data;
};

// ============================================
// FUNCTION 8: Sign In Anonymously (Guest login)
// ============================================
// Supabase doesn't have anonymous auth by default like Firebase.
// For now, this function will throw an error.
// If anonymous login is needed, you would implement a custom solution,
// e.g., creating a temporary user with a special email pattern or
// using a separate 'guest_sessions' table.
export const doSignInAnonymously = async () => {
  throw new Error('Anonymous sign-in not directly supported. Consider creating a guest user system.');
};
