import React, { useState } from 'react';
import classes from '../ForgetPassword/ForgetPassword.module.css';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';

export default function ForgetPassword() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Normalize email to lowercase for consistent checking
      const normalizedEmail = values.email.toLowerCase().trim();

      // Get a reference to the user document
      const userDocRef = doc(db, 'users', normalizedEmail);
      const userDoc = await getDoc(userDocRef);

      // Check if the user document exists
      if (!userDoc.exists()) {
        setError('No registered account found with this email');
        setIsLoading(false);
        setSubmitting(false);
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, normalizedEmail);
      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error('Password reset error:', error);
      // Handle error cases
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className={`${classes.backgroundimage} flex items-center justify-center min-h-screen bg-gray-50 p-4`}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  Password reset link has been sent to your email address.
                  Please check your inbox.
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <Field name="email">
                  {({ field }) => (
                    <div>
                      <input
                        {...field}
                        type="email"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--main-color)] 
                        ${
                          errors.email && touched.email
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                      />
                      {errors.email && touched.email && (
                        <div className="text-red-500 text-sm mt-1">
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
                className={`w-full py-2 px-4 rounded-md text-white font-medium
                ${
                  isSubmitting
                    ? 'bg-[var(--main-color)] cursor-not-allowed'
                    : 'bg-[var(--main-color)] hover:bg-[var(--main-color)]'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Sending Reset Link
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="w-full mt-3 py-2 px-4 border border-gray-300 rounded-md text-gray-700 
                font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back to Login
                </div>
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
