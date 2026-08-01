import React from 'react';
import { useNavigate } from 'react-router-dom';
import classes from '../ForgetPassword/ForgetPassword.module.css';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { DoPasswordReset } from '../../supabase/auth';
import { getAuthErrorMessage, normalizeEmail } from '../../supabase/authErrors';
import BrandLogo from '../BrandLogo/BrandLogo';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required'),
});

export default function ForgetPassword() {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const email = normalizeEmail(values.email);
      await DoPasswordReset(email);
      // Always show the same success copy (Supabase may not reveal if email exists)
      toast.success(
        'If an account exists for that email, a reset link is on its way. Check inbox and spam.'
      );
      resetForm();
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(
        getAuthErrorMessage(error, 'Failed to send reset email. Please try again.')
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
                          autoComplete="email"
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
                  onClick={() => navigate('/login')}
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
