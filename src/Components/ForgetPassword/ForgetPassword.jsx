// ============================================
// FORGET PASSWORD COMPONENT
// ============================================
// This component handles password reset requests
// It uses Supabase for authentication

import React, { useState } from 'react';
import classes from '../ForgetPassword/ForgetPassword.module.css';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { DoPasswordReset } from '../../supabase/auth';
import { supabase } from '../../supabase/supabase';

export default function ForgetPassword() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // STEP 1: Define validation schema
  // Yup ensures email is in valid format
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
  });

  // STEP 2: Handle password reset request
  // This function is called when the form is submitted
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // STEP 2a: Normalize email to lowercase for consistent checking
      const normalizedEmail = values.email.toLowerCase().trim();

      // STEP 2b: Check if user exists in database
      // We query the profiles table to verify the email exists
      // This prevents sending reset emails to non-existent accounts
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', normalizedEmail)
        .single();

      // STEP 2c: If profile doesn't exist, show error
      if (profileError || !profile) {
        setError('No registered account found with this email');
        setIsLoading(false);
        setSubmitting(false);
        return;
      }

      // STEP 2d: Send password reset email via Supabase
      // DoPasswordReset sends an email with a reset link
      // The user clicks the link and is redirected to a page where they can set a new password
      await DoPasswordReset(normalizedEmail);
      
      // STEP 2e: Show success message
      setSuccess(true);
      resetForm(); // Clear the form
    } catch (error) {
      // STEP 2f: Handle errors
      console.error('Password reset error:', error);
      
      // Show user-friendly error messages
      if (error.message?.includes('not found') || error.message?.includes('No registered')) {
        setError('No registered account found with this email');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      // STEP 2g: Always re-enable form
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // STEP 3: Render the Forget Password Page
  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
      <div className={`${classes.backgroundimage} relative hidden min-h-[20rem] lg:block`}>
        <div className="absolute inset-0 bg-nabat-primary/50" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
          <p className="font-heading text-5xl font-medium tracking-tight">Nabat</p>
          <p className="mt-3 max-w-sm font-body text-white/80">
            We&apos;ll help you get back in
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-16 md:px-12">
        <div className="w-full max-w-md">
          <p className="section-label">Account</p>
          <h2 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
            Forgot password
          </h2>
          <p className="mt-3 font-body text-sm text-nabat-muted">
            Enter your email and we&apos;ll send a reset link.
          </p>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="mt-10 space-y-6">
                {error && (
                  <div className="border border-red-200 bg-red-50 p-3 font-nav text-sm text-red-600">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="border border-nabat-border bg-nabat-mist p-3 font-nav text-sm text-nabat-primary">
                    Password reset link has been sent to your email address.
                    Please check your inbox.
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="section-label !mb-2">
                    Email address
                  </label>
                  <Field name="email">
                    {({ field }) => (
                      <div>
                        <input
                          {...field}
                          type="email"
                          className={`input-field ${
                            errors.email && touched.email ? 'border-red-500' : ''
                          }`}
                          placeholder="Enter your email"
                          disabled={isSubmitting}
                        />
                        {errors.email && touched.email && (
                          <div className="mt-1 font-nav text-sm text-red-500">
                            {errors.email}
                          </div>
                        )}
                      </div>
                    )}
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="btn-outline w-full"
                >
                  Back to Login
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
