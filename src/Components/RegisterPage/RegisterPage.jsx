import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from '../RegisterPage/RegisterPage.module.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from 'firebase/auth';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';

export default function RegisterPage() {
  const [showNameInput, setShowNameInput] = useState(false);
  const navigate = useNavigate();

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
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
  });

  const guestValidationSchema = Yup.object({
    guestName: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
  });

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      const { email, password, name } = values;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        await setDoc(doc(db, 'Users', user.uid), {
          email: user.email,
          fullname: name,
        });
      }
      toast.success('You have Successfully Registered');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error('Something went wrong');
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
          isGoogle: true,
        });
      }
  
      toast.success('Successfully signed in with Google');
      setTimeout(() => navigate('/login'), 3000);
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
        });
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
    <div className={`${classes.backgroundimage} flex justify-center items-center min-h-screen`}>
      <div className="bg-white p-8 shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create an Account
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
            <Form className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="w-full mt-1 p-2 border border-gray-300 shadow-sm focus:ring-[var(--main-color)] focus:border-[var(--main-color)]"
                  placeholder="Enter your name"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

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
                  placeholder="Create a password"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-[var(--main-color)] text-white font-semibold hover:bg-[var(--main-color)] focus:outline-none focus:ring-2 focus:ring-[var(--main-color)]"
              >
                Sign Up
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-md text-gray-600 text-center mt-4">
          Already have an account?
          <button
            onClick={() => navigate('/login')}
            className="text-[var(--main-color)] text-md hover:underline ml-1"
          >
            Sign in
          </button>
        </p>

        <div className="flex items-center mt-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">or sign up with</span>
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
  );
}