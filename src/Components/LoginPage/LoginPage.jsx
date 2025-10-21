import React, { useState } from 'react';
import classes from '../LoginPage/LoginPage.module.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from 'firebase/auth';
import { auth, db } from '../../firebase/firebase';
import { setDoc, doc } from 'firebase/firestore';

export default function LoginPage() {
  const [showNameInput, setShowNameInput] = useState(false);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    rememberMe: Yup.boolean()
  });

  const guestValidationSchema = Yup.object({
    guestName: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least  3 characters')
      .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
  });

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        values.email, 
        values.password
      );
      const user = userCredential.user;

      // Update user's last login in database
      if (user) {
        await setDoc(doc(db, 'Users', user.uid), {
          lastLogin: new Date().toISOString(),
          loginMethod: 'email',
        }, { merge: true });
      }

      toast.success('User Logged In Successfully');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          fullname: user.displayName,
          lastLogin: new Date().toISOString(),
          loginMethod: 'google',
          isGoogle: true,
        }, { merge: true });
      }

      toast.success('Successfully signed in with Google');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      toast.error('Something went wrong');
    }
  };

  const handleAnonymousSignIn = async (values, { setSubmitting }) => {
    try {
      const result = await signInAnonymously(auth);
      const user = result.user;

      if (user) {
        await setDoc(doc(db, 'Users', user.uid), {
          name: values.guestName,
          isAnonymous: true,
          lastLogin: new Date().toISOString(),
          loginMethod: 'anonymous',
        }, { merge: true });
      }

      toast.success('Successfully signed in as guest');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Error during anonymous sign-in:', error);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={`${classes.backgroundimage} flex justify-center items-center min-h-screen`}>
        <div className="bg-white p-8 shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Sign In
          </h2>

          <Formik
            initialValues={{
              email: '',
              password: '',
              rememberMe: false
            }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting }) => (
              <Form className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="w-full mt-1 p-2 border border-gray-300 shadow-sm focus:ring-[var(--main-color)] focus:border-[var(--main-color)]"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="w-full mt-1 p-2 border border-gray-300 shadow-sm focus:ring-[var(--main-color)] focus:border-[var(--main-color)]"
                    placeholder="Enter your password"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center">
                    <Field
                      type="checkbox"
                      name="rememberMe"
                      className="text-[var(--main-color)] focus:ring-[var(--main-color)]"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgetpassword')}
                    className="text-sm text-[var(--main-color)] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-[var(--main-color)] text-white font-semibold hover:bg-[var(--main-color)] focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
                >
                  Sign In
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-md text-gray-600 text-center mt-4">
            Don't have an account?
            <button
              onClick={() => navigate('/register')}
              className="text-[var(--main-color)] text-md hover:underline ml-1"
            >
              Sign Up
            </button>
          </p>

          <div className="flex items-center mt-6">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">or continue with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 hover:bg-gray-50"
            >
              <i className="fa-brands fa-google mr-2"></i>
              Google
            </button>
          </div>

          {!showNameInput ? (
            <button
              onClick={() => setShowNameInput(true)}
              className="w-full mt-3 py-2 px-4 bg-[var(--main-color)] text-white font-semibold hover:bg-[var(--main-color)] focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
            >
              Continue as Guest
            </button>
          ) : (
            <Formik
              initialValues={{
                guestName: '',
              }}
              validationSchema={guestValidationSchema}
              onSubmit={handleAnonymousSignIn}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label
                      htmlFor="guestName"
                      className="block mt-3 text-sm font-medium text-gray-700"
                    >
                      Your Name
                    </label>
                    <Field
                      type="text"
                      id="guestName"
                      name="guestName"
                      className="w-full mt-1 p-2 border border-gray-300 shadow-sm focus:ring-[var(--main-color)] focus:border-[var(--main-color)]"
                      placeholder="Enter your name"
                    />
                    <ErrorMessage name="guestName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 py-2 px-4 bg-[var(--main-color)] text-white font-semibold hover:bg-[var(--main-color)] focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
                  >
                    Continue
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </>
  );
}