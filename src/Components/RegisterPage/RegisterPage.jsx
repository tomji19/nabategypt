// ============================================
// REGISTRATION PAGE COMPONENT
// ============================================
// This component handles user registration
// It uses Supabase for authentication

import React from 'react';
import { useNavigate } from 'react-router-dom';
import classes from '../RegisterPage/RegisterPage.module.css';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from '../../supabase/auth';
import { supabase } from '../../supabase/supabase';
import BrandLogo from '../BrandLogo/BrandLogo';

export default function RegisterPage() {
  const navigate = useNavigate();

  // STEP 1: Define validation schema for registration form
  // Yup ensures name, email, and password meet specific criteria.
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(4, 'Name must be at least 4 characters')
      .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, // Requires uppercase, lowercase, and number
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
  });

  // STEP 2: Handle user registration
  // This function is called when the registration form is submitted.
  // It's an async function because it makes an API call to Supabase.
  const handleRegister = async (values, { setSubmitting }) => {
    try {
      // Extract name, email, and password from form values
      const { name, email, password } = values;
      
      // STEP 2a: Call Supabase registration function
      // doCreateUserWithEmailAndPassword is from our custom auth.jsx file.
      // It sends user data to Supabase and includes metadata (name, fullname).
      const data = await doCreateUserWithEmailAndPassword(email, password, {
        name,
        fullname: name,
      });

      // STEP 2b: Profile Creation
      // The trigger (handle_new_user) automatically creates the profile
      // We don't need to manually create it here - the trigger handles it
      // The trigger runs AFTER the user is created in auth.users
      // It has SECURITY DEFINER so it can bypass RLS policies
      
      // Optional: Wait a moment for trigger to complete, then update if needed
      // This is only needed if you want to set additional fields immediately
      if (data?.user) {
        // Wait a bit for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to update profile with additional info (if trigger already created it)
        // This is optional - the trigger already creates it with name/fullname
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              login_method: 'email',
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.user.id);

          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 = not found (trigger might not have run yet)
            // Other errors are logged but don't break registration
            console.warn('Could not update profile immediately:', profileError);
            // This is OK - trigger will create it, and user can update later
          }
        } catch (updateError) {
          // Profile update failed - that's OK, trigger will create it
          console.warn('Profile update not critical:', updateError);
        }
      }

      // STEP 2c: Show success message with email confirmation instructions
      // IMPORTANT: User must confirm their email before they can log in
      // Supabase automatically sends a confirmation email when user registers
      // The email contains a link that confirms the email address
      // After clicking the link, user will be redirected to /login?confirmed=true
      
      // Check if email confirmation is required
      const needsConfirmation = data?.user && !data.user.email_confirmed_at;
      
      if (needsConfirmation) {
        // Email confirmation is required
        toast.success(
          'Registration successful! Please check your email inbox (and spam folder) for a confirmation link. You must confirm your email before signing in.',
          { duration: 8000 } // Longer duration so user can read the message
        );
      } else {
        // Email already confirmed (shouldn't happen normally, but handle it)
        toast.success(
          'Registration successful! You can now sign in.',
          { duration: 5000 }
        );
      }
      
      // STEP 2d: Navigate to login page after a short delay
      // Gives the user time to read the success message.
      setTimeout(() => {
        navigate('/login');
      }, 2000); // 2-second delay
    } catch (error) {
      // STEP 2e: Handle registration errors
      // Log the error for debugging purposes.
      console.error('Registration error:', error);
      
      // Show user-friendly error messages based on the error type.
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else if (error.message?.includes('Password')) {
        toast.error('Password does not meet requirements.');
      } else {
        toast.error(error.message || 'Failed to register. Please try again.');
      }
    } finally {
      // STEP 2f: Always re-enable submit button
      setSubmitting(false);
    }
  };

  // STEP 3: Handle Google Sign-in (OAuth)
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

  // STEP 4: Render the Registration Page UI
  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      <div className={`${classes.backgroundimage} relative hidden min-h-[20rem] lg:block`}>
        <div className="absolute inset-0 bg-nabat-primary/50" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
          <BrandLogo imgClassName="h-14 w-auto object-contain brightness-0 invert" />
          <p className="mt-3 max-w-sm font-body text-white/80">
            Join the greenhouse community
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-16 md:px-12">
        <div className="w-full max-w-md">
          <p className="section-label">Get started</p>
          <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
            Create an account
          </h2>

          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ isSubmitting }) => (
              <Form className="mt-10 space-y-6">
                <div>
                  <label htmlFor="name" className="section-label !mb-2">
                    Name
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className="input-field"
                    placeholder="Enter your name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="mt-1 font-nav text-sm text-red-500"
                  />
                </div>

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
                    placeholder="Create a password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-1 font-nav text-sm text-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  Sign Up
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 font-nav text-sm text-nabat-muted">
            Already have an account?
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="ml-1 text-nabat-accent hover:underline"
            >
              Sign in
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
  );
}
