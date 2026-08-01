import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { supabase } from '../../supabase/supabase';
import { doPasswordChange } from '../../supabase/auth';
import { getAuthErrorMessage } from '../../supabase/authErrors';
import BrandLogo from '../BrandLogo/BrandLogo';
import PlantLoader from '../PlantLoader/PlantLoader';

const schema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const allow = () => {
      if (!mounted) return;
      setAllowed(true);
      setReady(true);
    };

    const deny = (message) => {
      if (!mounted) return;
      setAllowed(false);
      setReady(true);
      toast.error(message);
    };

    // Recovery session from URL is handled by detectSessionInUrl
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        allow();
      }
    });

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        allow();
        return;
      }
      // Give Supabase a moment to parse the recovery link
      timeoutId = setTimeout(async () => {
        const {
          data: { session: later },
        } = await supabase.auth.getSession();
        if (later?.user) allow();
        else {
          deny(
            'This reset link is invalid or expired. Please request a new one.'
          );
        }
      }, 1500);
    })();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  if (!ready) return <PlantLoader variant="overlay" />;

  if (!allowed) {
    return (
      <div className="section-pad flex min-h-[60vh] items-center justify-center py-16">
        <div className="max-w-md text-center">
          <h1 className="font-heading text-2xl">Reset link unavailable</h1>
          <p className="mt-3 font-body text-nabat-muted">
            Request a new password reset email to continue.
          </p>
          <Link to="/forgetpassword" className="btn-primary mt-8 inline-flex">
            Request reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-pad flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md border border-nabat-border bg-white p-8 md:p-10">
        <BrandLogo imgClassName="mb-6 h-10 w-auto object-contain" />
        <p className="section-label">Account</p>
        <h1 className="font-heading text-3xl font-medium">Set new password</h1>
        <p className="mt-2 font-body text-sm text-nabat-muted">
          Choose a strong password for your Nabat account.
        </p>

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await doPasswordChange(values.password);
              toast.success('Password updated. You can sign in now.');
              await supabase.auth.signOut({ scope: 'local' });
              navigate('/login', { replace: true });
            } catch (error) {
              toast.error(getAuthErrorMessage(error, 'Could not update password.'));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-5">
              <div>
                <label className="section-label !mb-2" htmlFor="password">
                  New password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className="input-field"
                  placeholder="New password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 font-nav text-sm text-red-500"
                />
              </div>
              <div>
                <label className="section-label !mb-2" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="input-field"
                  placeholder="Confirm password"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="mt-1 font-nav text-sm text-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-60"
              >
                {isSubmitting ? 'Saving…' : 'Update password'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
