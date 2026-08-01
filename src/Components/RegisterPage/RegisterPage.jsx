import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classes from '../RegisterPage/RegisterPage.module.css';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { doCreateUserWithEmailAndPassword } from '../../supabase/auth';
import { getAuthErrorMessage, normalizeEmail } from '../../supabase/authErrors';
import { supabase } from '../../supabase/supabase';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useAuth } from '../AuthContext/AuthContext';
import { getPostAuthRedirect } from '../../utils/authRedirect';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userLoggedIn, loading: authLoading } = useAuth();
  const redirectTo = getPostAuthRedirect(location, '/');

  useEffect(() => {
    if (!authLoading && userLoggedIn) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, userLoggedIn, navigate, redirectTo]);

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      const name = values.name.trim();
      const email = normalizeEmail(values.email);

      const data = await doCreateUserWithEmailAndPassword(email, values.password, {
        name,
        fullname: name,
      });

      if (data?.user?.id) {
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email || email,
            name,
            fullname: name,
            login_method: 'email',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
        if (profileError) {
          console.warn('Profile upsert warning:', profileError);
        }
      }

      if (data?.user && !data.user.email_confirmed_at) {
        toast.success(
          'Account created! Check your email (and spam) for a confirmation link before signing in.'
        );
      } else {
        toast.success('Registration successful! You can now sign in.');
      }

      navigate('/login', { state: { from: redirectTo } });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        getAuthErrorMessage(error, 'Failed to register. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

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
            initialValues={{ name: '', email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ isSubmitting }) => (
              <Form className="mt-10 space-y-5">
                <div>
                  <label htmlFor="name" className="section-label !mb-2">
                    Name
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className="input-field"
                    placeholder="Your name"
                    autoComplete="name"
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
                    autoComplete="email"
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
                    autoComplete="new-password"
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
                  {isSubmitting ? 'Creating account…' : 'Create account'}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 font-nav text-sm text-nabat-muted">
            Already have an account?
            <button
              type="button"
              onClick={() =>
                navigate('/login', { state: { from: redirectTo } })
              }
              className="ml-1 text-nabat-accent hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
