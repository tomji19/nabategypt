import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import classes from '../LoginPage/LoginPage.module.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { doSignInWithEmailAndPassword, doSendEmailVerification } from '../../supabase/auth';
import { getAuthErrorMessage, normalizeEmail } from '../../supabase/authErrors';
import { supabase } from '../../supabase/supabase';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useAuth } from '../AuthContext/AuthContext';
import { getPostAuthRedirect } from '../../utils/authRedirect';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: Yup.boolean(),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { userLoggedIn, loading: authLoading } = useAuth();
  const redirectTo = getPostAuthRedirect(location, '/');

  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    const errorDescription =
      searchParams.get('error_description') || searchParams.get('error');

    if (errorDescription) {
      toast.error(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
      return;
    }
    if (confirmed === 'true') {
      toast.success('Email confirmed successfully! You can now sign in.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && userLoggedIn) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, userLoggedIn, navigate, redirectTo]);

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const email = normalizeEmail(values.email);
      const data = await doSignInWithEmailAndPassword(email, values.password);

      if (data?.user?.id) {
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email || null,
            name:
              data.user.user_metadata?.name ||
              data.user.user_metadata?.fullname ||
              '',
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
        if (profileError) {
          console.warn('Profile upsert warning:', profileError);
        }
      }

      toast.success('Signed in successfully!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const message = getAuthErrorMessage(error, 'Failed to sign in. Please try again.');
      toast.error(message);

      if (
        error.code === 'email_not_confirmed' ||
        message.toLowerCase().includes('confirm your email')
      ) {
        try {
          await doSendEmailVerification(values.email);
          toast.info('We sent another confirmation email. Check your inbox.');
        } catch (resendErr) {
          toast.error(
            getAuthErrorMessage(resendErr, 'Could not resend confirmation email.')
          );
        }
      }
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
          {redirectTo !== '/' && (
            <p className="mt-2 font-nav text-sm text-nabat-muted">
              Sign in to continue to checkout / your account.
            </p>
          )}

          <Formik
            initialValues={{ email: '', password: '', rememberMe: false }}
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
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
                  {isSubmitting ? 'Signing in…' : 'Sign In'}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 font-nav text-sm text-nabat-muted">
            Don&apos;t have an account?
            <button
              type="button"
              onClick={() =>
                navigate('/register', { state: { from: redirectTo } })
              }
              className="ml-1 text-nabat-accent hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
