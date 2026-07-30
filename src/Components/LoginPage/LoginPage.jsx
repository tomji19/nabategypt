// ============================================
// LOGIN PAGE COMPONENT
// ============================================
// This component handles user authentication (login)
// It uses Supabase for authentication

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import classes from '../LoginPage/LoginPage.module.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../supabase/auth';
import { supabase } from '../../supabase/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // STEP 1: Check for email confirmation redirect
  // useEffect runs after component renders. The empty array [] means it runs once on mount.
  // searchParams.get('confirmed') checks if the URL has '?confirmed=true'
  // This happens when a user clicks the email confirmation link from Supabase.
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true') {
      // Show a success toast message to the user
      toast.success('Email confirmed successfully! You can now sign in.');
    }
  }, [searchParams]); // Dependency array: re-run if searchParams change

  // STEP 2: Define validation schema for login form
  // Yup is a library for object schema validation.
  // It ensures email is valid format and password meets length requirements.
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    rememberMe: Yup.boolean()
  });

  // STEP 3: Handle user login
  // This function is called when the login form is submitted.
  // It's an async function because it makes an API call to Supabase.
  const handleLogin = async (values, { setSubmitting }) => {
    try {
      // Extract email and password from form values
      const { email, password } = values;
      
      // STEP 3a: Call Supabase sign-in function
      // doSignInWithEmailAndPassword is from our custom auth.jsx file.
      // It handles the actual communication with Supabase.
      const data = await doSignInWithEmailAndPassword(email, password);

      // STEP 3b: Check if email is confirmed
      // Supabase requires email confirmation by default.
      // If data.user exists but email_confirmed_at is null, the email is not confirmed.
      if (data?.user && !data.user.email_confirmed_at) {
        toast.warning(
          'Please confirm your email before signing in. Check your inbox for the confirmation link.',
          { duration: 6000 }
        );
        setSubmitting(false); // Re-enable the submit button
        return; // Stop the login process
      }

      // STEP 3c: CRITICAL - Check if profile exists in database
      // User can only log in if their profile exists in profiles table
      // This ensures data integrity and prevents orphaned auth accounts
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // STEP 3c-1: If profile doesn't exist, sign user out and show error
        // This prevents login without a profile
        if (profileError || !profile) {
          console.error('❌ Profile not found for user:', data.user.email);
          
          // Sign user out immediately - they shouldn't be logged in without a profile
          await supabase.auth.signOut();
          
          toast.error(
            'Account not found. Please register first or contact support.',
            { duration: 5000 }
          );
          setSubmitting(false);
          return;
        }

        // STEP 3d: Profile exists - update last login timestamp
        // After successful login, we update the 'profiles' table in our database.
        // This helps track user activity.
        await supabase
          .from('profiles')
          .update({
            last_login: new Date().toISOString(), // Set current timestamp
          })
          .eq('id', data.user.id); // Update only the current user's profile
      }

      // STEP 3e: Show success message and navigate
      toast.success('Signed in successfully!');
      // Navigate to the home page after a short delay for the toast to be seen.
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      // STEP 3f: Handle login errors
      // Log the error for debugging purposes.
      console.error('Login error:', error);
      
      // Show user-friendly error messages based on the error type.
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid')) {
        toast.error('Invalid email or password');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Please confirm your email before signing in.');
      } else {
        toast.error(error.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      // STEP 3g: Always re-enable submit button
      // Ensures the button is clickable again after the async operation finishes.
      setSubmitting(false);
    }
  };

  // STEP 4: Handle Google Sign-in (OAuth)
  // This function will initiate the Google authentication flow.
  const handleGoogleSignIn = async () => {
    try {
      await doSignInWithGoogle();
      // Note: OAuth redirects the page, so this might not execute
      // The redirect will happen automatically
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      toast.error('Something went wrong with Google sign-in');
    }
  };

  // STEP 5: Render the Login Page UI
  return (
    <>
      <ToastContainer />
      <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
        <div className={`${classes.backgroundimage} relative hidden min-h-[20rem] lg:block`}>
          <div className="absolute inset-0 bg-nabat-primary/50" />
          <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
            <p className="font-heading text-5xl font-medium tracking-tight">Nabat</p>
            <p className="mt-3 max-w-sm font-body text-white/80">
              Delivering life to your doorstep
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white px-6 py-16 md:px-12">
          <div className="w-full max-w-md">
            <p className="section-label">Welcome back</p>
            <h2 className="font-heading text-3xl font-medium tracking-tight text-nabat-text md:text-4xl">
              Sign in
            </h2>

            <Formik
              initialValues={{
                email: '',
                password: '',
                rememberMe: false,
              }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
            >
              {({ isSubmitting }) => (
                <Form className="mt-10 space-y-6">
                  <div>
                    <label htmlFor="email" className="section-label !mb-2">
                      Email
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className="input-field"
                      placeholder="Enter your email"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-1 font-nav text-sm text-red-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="section-label !mb-2">
                      Password
                    </label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className="input-field"
                      placeholder="Enter your password"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="mt-1 font-nav text-sm text-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center">
                      <Field
                        type="checkbox"
                        name="rememberMe"
                        className="accent-nabat-accent"
                      />
                      <span className="ml-2 font-nav text-sm text-nabat-muted">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgetpassword')}
                      className="font-nav text-sm text-nabat-accent hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full disabled:opacity-60"
                  >
                    Sign In
                  </button>
                </Form>
              )}
            </Formik>

            <p className="mt-6 font-nav text-sm text-nabat-muted">
              Don&apos;t have an account?
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="ml-1 text-nabat-accent hover:underline"
              >
                Sign Up
              </button>
            </p>

            <div className="mt-8 flex items-center">
              <hr className="flex-grow border-nabat-border" />
              <span className="px-3 font-nav text-[10px] uppercase tracking-[0.16em] text-nabat-muted">
                or
              </span>
              <hr className="flex-grow border-nabat-border" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn-outline mt-6 flex w-full items-center justify-center"
            >
              <i className="fa-brands fa-google mr-2"></i>
              Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
