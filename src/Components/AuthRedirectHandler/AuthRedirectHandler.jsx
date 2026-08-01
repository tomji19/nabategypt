import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../../supabase/supabase';

/**
 * Handles Supabase auth redirects (email confirm, recovery, OAuth errors)
 * that land with ?error= / ?code= / hash params.
 */
export default function AuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));

    const error =
      params.get('error_description') ||
      params.get('error') ||
      hashParams.get('error_description') ||
      hashParams.get('error');

    if (error) {
      toast.error(decodeURIComponent(String(error).replace(/\+/g, ' ')));
      // Clean ugly error params from the URL
      navigate(location.pathname, { replace: true });
      return;
    }

    const type = hashParams.get('type') || params.get('type');
    if (type === 'recovery' && location.pathname !== '/reset-password') {
      navigate('/reset-password', { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (window.location.pathname !== '/reset-password') {
          navigate('/reset-password', { replace: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}
