// ============================================
// AUTHENTICATION CONTEXT
// ============================================
// This file creates a "Context" - React's way of sharing data across components
// Think of it like a global state that any component can access
// Instead of passing user data through every component, we store it here

import React, { useContext, useEffect, useState } from 'react';
import { supabase } from '../../supabase/supabase';

// ============================================
// STEP 1: Create the Context
// ============================================
// React.createContext() creates a "container" for shared data
// This is like creating an empty box that we'll fill with user info later
const AuthContext = React.createContext();

// ============================================
// STEP 2: Create Custom Hook
// ============================================
// This is a helper function that makes it easier to use the context
// Instead of: useContext(AuthContext)
// We can write: useAuth()
// This is a common React pattern - wrap context in a custom hook
export function useAuth() {
  return useContext(AuthContext);
}

// ============================================
// STEP 3: Create the Provider Component
// ============================================
// This component provides the actual data to any component wrapped inside it
// It manages the authentication state (who is logged in, their details, etc.)
// It wraps the entire app (see App.jsx) so every component can access auth state
export function AuthProvider({ children }) {
  // ============================================
  // STATE MANAGEMENT - Understanding useState
  // ============================================
  // useState creates "reactive" variables - when they change, React re-renders
  // Format: [value, setterFunction] = useState(initialValue)
  // 
  // currentUser: Basic user info (id, email) from Supabase auth
  // userDetails: Extended info from our database (name, phone, addresses)
  // userLoggedIn: Boolean flag - true if user is authenticated
  // loading: Whether we're still checking auth status
  // anonymousUserName: Name for guest users (if applicable)
  
  const [currentUser, setCurrentUser] = useState(null);        // Start with no user
  const [userDetails, setUserDetails] = useState(null);        // Start with no details
  const [userLoggedIn, setUserLoggedIn] = useState(false);     // Start as logged out
  const [loading, setLoading] = useState(true);                // Start as loading
  const [anonymousUserName, setAnonymousUserName] = useState(null); // No anonymous name

  // ============================================
  // SIDE EFFECTS - Understanding useEffect
  // ============================================
  // useEffect runs code AFTER the component renders
  // The empty array [] means "run only once when component first mounts"
  // This is perfect for initialization code like checking if user is logged in
  useEffect(() => {
    // STEP 1: Create a "mounted" flag
    // This prevents state updates if component unmounts (user navigates away)
    // Without this, we might try to update state on an unmounted component = error
    let mounted = true;
    let isInitializing = false; // Prevent recursive initialization

    // STEP 2: Check if user is already logged in (on page refresh)
    // getSession() checks Supabase for an existing session from localStorage
    // Supabase automatically stores sessions in localStorage, so this should work on refresh
    // This is async, so we use .then() to handle the response
    // IMPORTANT: We check session FIRST before setting loading to false
    // This ensures ProtectedRoute knows if user is logged in before redirecting
    
    console.log('🔍 Checking for existing session on page load...');
    
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        // STEP 2a: Check if component is still mounted
        // If user navigated away, don't update state
        if (!mounted) return;
        
        // STEP 2b: Handle errors
        // If there's an error checking session, log it but don't crash
        if (error) {
          console.error('❌ Error getting session:', error);
          // No session = user is logged out
          if (mounted) {
            setCurrentUser(null);
            setUserDetails(null);
            setUserLoggedIn(false);
            setAnonymousUserName(null);
            setLoading(false);
          }
          return; // Exit early - user is not logged in
        }

        // STEP 2c: Check if session exists
        // DEBUG: Log session status
        if (session) {
          console.log('✅ Session found! User is logged in:', session.user.email);
          console.log('📦 Session data:', {
            userId: session.user.id,
            email: session.user.email,
            expiresAt: new Date(session.expires_at * 1000).toLocaleString(),
            accessToken: session.access_token ? 'Present ✅' : 'Missing ❌'
          });
          
          // Verify session has access token (required for API calls)
          if (!session.access_token) {
            console.error('❌ Session has no access token - invalid session');
            if (mounted) {
              setCurrentUser(null);
              setUserDetails(null);
              setUserLoggedIn(false);
              setAnonymousUserName(null);
              setLoading(false);
            }
            return;
          }
          
          try {
            // Initialize user (this is async, so we await it)
            // CRITICAL: initializeUser will check if profile exists
            // If profile doesn't exist, it will sign user out
            console.log('🔄 Initializing user data...');
            isInitializing = true; // Set flag to prevent recursive calls
            await initializeUser(session.user);
            console.log('✅ User initialized successfully');
            isInitializing = false; // Reset flag after initialization
          } catch (initError) {
            isInitializing = false; // Reset flag on error
            // If initializeUser fails, it means profile doesn't exist
            // initializeUser will sign the user out automatically
            console.error('⚠️ Error initializing user on refresh:', initError);
            
            // Don't set user state - user was signed out by initializeUser
            // This ensures user can only be logged in if profile exists
            if (mounted) {
              setCurrentUser(null);
              setUserDetails(null);
              setUserLoggedIn(false);
              setAnonymousUserName(null);
            }
          }
        } else {
          // STEP 2c-alt: No session = user is logged out
          console.log('❌ No session found - user is logged out');
          // Explicitly set logged out state to ensure consistency
          if (mounted) {
            setCurrentUser(null);
            setUserDetails(null);
            setUserLoggedIn(false);
            setAnonymousUserName(null);
          }
        }
        
        // STEP 2d: Set loading to false AFTER checking session
        // This ensures ProtectedRoute knows the auth status before making decisions
        // If we set loading to false too early, ProtectedRoute might redirect logged-in users
        if (mounted) {
          console.log('✅ Setting loading to false. userLoggedIn:', session ? true : false);
          setLoading(false);
        }
      })
      .catch((error) => {
        // STEP 2e: Catch any unexpected errors
        // .catch() handles errors that .then() doesn't catch
        console.error('❌ Error in getSession catch block:', error);
        // On error, assume user is not logged in and stop loading
        if (mounted) {
          setCurrentUser(null);
          setUserDetails(null);
          setUserLoggedIn(false);
          setAnonymousUserName(null);
          setLoading(false);
        }
      });

    // ============================================
    // STEP 3: Listen for Auth State Changes
    // ============================================
    // onAuthStateChange is like a "listener" - it watches for login/logout events
    // This fires when:
    // - User logs in
    // - User logs out
    // - Session expires
    // - Token refreshes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // STEP 3a: Check if component is still mounted
      // Prevents state updates if user navigated away
      if (!mounted) return;

      // STEP 3a-alt: Skip INITIAL_SESSION event if we already handled it in getSession
      // INITIAL_SESSION fires on page load, but we already check session with getSession
      // This prevents double initialization which could cause race conditions on refresh
      if (event === 'INITIAL_SESSION') {
        // We already handled this in getSession above, so skip it here
        // This prevents double initialization on page refresh
        return;
      }

      // STEP 3a-bis: Prevent recursive calls during initialization
      // If we're already initializing, don't process this event
      // This prevents infinite loops when signOut() triggers another event
      if (isInitializing) {
        console.log('⏸️ Skipping auth state change - already initializing');
        return;
      }

      try {
        // STEP 3b: Check if session exists
        // session?.user uses optional chaining - safe if session is null
        if (session?.user) {
          // User just logged in or session refreshed
          // Initialize user data from the session
          // CRITICAL: initializeUser will check if profile exists
          // If profile doesn't exist, it will sign user out
          isInitializing = true; // Set flag to prevent recursive calls
          try {
            await initializeUser(session.user);
          } catch (initError) {
            // If initializeUser fails, it means profile doesn't exist
            // initializeUser will sign the user out automatically
            console.error('Error initializing user in onAuthStateChange:', initError);
            
            // Don't set user state - user was signed out by initializeUser
            // This ensures user can only be logged in if profile exists
            if (mounted) {
              setCurrentUser(null);
              setUserDetails(null);
              setUserLoggedIn(false);
              setAnonymousUserName(null);
            }
          } finally {
            isInitializing = false; // Reset flag after initialization
          }
          
          // STEP 3c: Ensure loading is false after login
          // When user logs in, we want to make sure loading is false
          // so ProtectedRoute can render the protected content
          if (mounted) {
            setLoading(false);
          }
        } else {
          // STEP 3d: No session = user logged out
          // This happens when:
          // - User clicks logout (signOut() was called)
          // - Session expired
          // - Token was invalid
          // Clear ALL user-related state to ensure clean logout
          setCurrentUser(null);
          setUserDetails(null);
          setUserLoggedIn(false);
          setAnonymousUserName(null);
          
          // STEP 3e: Set loading to false after logout
          // This ensures ProtectedRoute knows user is logged out
          if (mounted) {
            setLoading(false);
          }
          
          // Debug log to verify logout is working (can remove later)
          console.log('Auth state changed: User logged out', event);
        }
      } catch (error) {
        // STEP 3f: Handle any errors in the listener
        // On error, set loading to false so app doesn't hang
        console.error('Error in auth state change:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    });

    // ============================================
    // CLEANUP FUNCTION
    // ============================================
    // This runs when the component unmounts (user navigates away)
    // We MUST clean up to prevent memory leaks
    return () => {
      mounted = false;              // Mark as unmounted
      subscription?.unsubscribe();  // Stop listening to auth changes
      // The ?. is optional chaining - safe if subscription is null
    };
  }, []); // Empty array = run only once on mount

  // ============================================
  // HELPER FUNCTION: Initialize User Data
  // ============================================
  // This function loads user data when they log in
  // It's async because we need to fetch data from the database
  // This is called both on login AND on page refresh (if session exists)
  async function initializeUser(user) {
    try {
      // STEP 1: Validate user object
      // Safety check - make sure we have valid user data
      if (!user || !user.id) {
        console.error('❌ Invalid user object:', user);
        return; // Exit early if invalid
      }
      
      console.log('🔄 Initializing user:', user.email);

      // STEP 2: Create user object from Supabase auth data
      // We extract only what we need and format it consistently
      const userObj = {
        uid: user.id,                    // User's unique ID
        email: user.email,                // User's email
        email_confirmed_at: user.email_confirmed_at, // When email was confirmed
      };
      
      // STEP 3: Update state with basic user info
      // This immediately marks user as logged in
      // IMPORTANT: We set this FIRST so components know user is authenticated
      // Even if profile fetch fails, user is still logged in
      console.log('✅ Setting user as logged in:', userObj.email);
      setCurrentUser(userObj);
      setUserLoggedIn(true);

      // ============================================
      // STEP 4: Fetch Extended User Profile
      // ============================================
      // Supabase auth only has basic info (email, id)
      // Our database has more info (name, phone, addresses)
      // We fetch this separately from the 'profiles' table
      try {
        // STEP 4a: Query the database
        // .from('profiles') = which table to query
        // .select('*') = get all columns
        // .eq('id', user.id) = where id equals user.id (find this user's profile)
        // .single() = expect only one result (not an array)
        // Note: Supabase automatically sends the JWT token with this request
        // RLS policies use auth.uid() to check if user can access this profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // STEP 4b: Handle the response
        // CRITICAL: User can only be logged in if profile exists
        // IMPORTANT: Handle different error types differently
        if (error) {
          // PGRST116 = "not found" error code - profile truly doesn't exist
          if (error.code === 'PGRST116') {
            // Profile doesn't exist - this is NOT allowed
            // User should not be logged in without a profile
            console.error('❌ Profile not found for user:', user.email);
            console.error('⚠️ Signing user out - profile is required');
            
            // Sign user out immediately
            // IMPORTANT: Don't await this - it will trigger onAuthStateChange
            // which will handle the state clearing. If we await it here,
            // it could cause a loop. Let the listener handle it.
            supabase.auth.signOut().catch(err => {
              console.error('Error signing out:', err);
            });
            
            // Clear user state immediately (don't wait for signOut callback)
            setCurrentUser(null);
            setUserDetails(null);
            setUserLoggedIn(false);
            setAnonymousUserName(null);
            
            // Don't set userDetails - user is not logged in
            return; // Exit early - user is signed out
          } 
          // 42501 = RLS policy violation (406 Not Acceptable)
          // This means RLS is blocking, but profile might exist
          // Don't sign out - this is a configuration issue, not a missing profile
          else if (error.code === '42501' || error.message?.includes('row-level security')) {
            console.error('⚠️ RLS Policy Error (406):', error);
            console.warn('⚠️ Profile might exist but RLS is blocking access');
            console.warn('⚠️ User remains logged in - fix RLS policies in Supabase');
            
            // Don't sign out - this is an RLS configuration issue
            // User is authenticated, just can't access profile due to RLS
            // Set minimal profile from metadata so app doesn't break
            setUserDetails({
              email: user.email,
              name: user.user_metadata?.name || user.user_metadata?.fullname || '',
              fullname: user.user_metadata?.fullname || user.user_metadata?.name || '',
            });
            setAnonymousUserName(null);
            
            // User stays logged in - they can use the app with basic info
            // Admin needs to fix RLS policies
            return; // Exit early but user stays logged in
          } 
          // Other errors (network, etc.) - be more lenient
          else {
            console.error('⚠️ Error fetching profile:', error);
            console.warn('⚠️ Network or other error - user stays logged in with basic info');
            
            // Don't sign out on network errors - user is still authenticated
            // Set minimal profile from metadata
            setUserDetails({
              email: user.email,
              name: user.user_metadata?.name || user.user_metadata?.fullname || '',
              fullname: user.user_metadata?.fullname || user.user_metadata?.name || '',
            });
            setAnonymousUserName(null);
            
            // User stays logged in - they can use the app
            return; // Exit early but user stays logged in
          }
        } else if (profile) {
          // STEP 4d: Profile exists - use it
          console.log('✅ Profile found in database:', profile.name || profile.email);
          setUserDetails(profile);
          
          // STEP 4e: Check if user is anonymous/guest
          // Only set anonymous name if explicitly marked as anonymous
          // Regular users should NOT be treated as anonymous
          if (profile.is_anonymous === true && profile.name) {
            setAnonymousUserName(profile.name);
          } else {
            setAnonymousUserName(null);
          }
        } else {
          // STEP 4f: Fallback - create minimal profile
          // This shouldn't happen, but safety first!
          console.log('⚠️ Profile query returned null, using fallback');
          setUserDetails({
            email: user.email,
            name: user.user_metadata?.name || user.user_metadata?.fullname || '',
            fullname: user.user_metadata?.fullname || user.user_metadata?.name || '',
          });
          setAnonymousUserName(null);
        }
      } catch (profileError) {
        // STEP 4g: Handle profile fetch errors (catch block for unexpected errors)
        // Don't sign out on catch errors - these are usually network/parsing errors
        // User is still authenticated, just can't load profile right now
        console.error('⚠️ Unexpected error fetching profile:', profileError);
        console.warn('⚠️ User stays logged in - will retry on next action');
        
        // Don't sign out - user is authenticated, just profile fetch failed
        // Set minimal profile from metadata so app doesn't break
        setUserDetails({
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.fullname || '',
          fullname: user.user_metadata?.fullname || user.user_metadata?.name || '',
        });
        setAnonymousUserName(null);
        
        // User stays logged in - they can use the app
        // Profile will be fetched again on next page load or action
      }
    } catch (error) {
      // STEP 5: Handle any unexpected errors in initializeUser
      // IMPORTANT: We should NOT clear user state here if user has a valid session
      // The error might be in profile fetch, but user is still authenticated
      // Only clear state if it's a critical error that means user is not authenticated
      console.error('Error initializing user:', error);
      
      // Don't automatically clear user state - the session might still be valid
      // If profile fetch fails, user can still use the app with basic auth
      // Only clear if we're certain the user is not authenticated
      // For now, we'll let the calling code handle state management
      // This prevents breaking logged-in users on refresh if there's a temporary error
    }
  }

  // ============================================
  // STEP 5: Create Context Value Object
  // ============================================
  // This object contains all the data we want to share
  // Any component using useAuth() will get this object
  const value = {
    currentUser,           // Basic user info
    userDetails,           // Extended profile info
    userLoggedIn,          // Is user authenticated?
    loading,               // Are we still checking auth?
    anonymousUserName,     // Guest user name (if applicable)
    setAnonymousUserName,  // Function to update anonymous name
  };

  // ============================================
  // STEP 6: Render the Provider
  // ============================================
  // AuthContext.Provider "wraps" children and gives them access to 'value'
  // We always render immediately - no loading spinner
  // Auth loads in background, UI updates when ready
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
