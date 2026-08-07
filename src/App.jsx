import React, { lazy } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './Components/CartContext/CartContext';
import { AuthProvider } from './Components/AuthContext/AuthContext';
import { ProductsProvider } from './Components/ProductsContext/ProductsContext';
import { WishlistProvider } from './Components/WishlistContext/WishlistContext';
import { LanguageProvider } from './Components/LanguageContext/LanguageContext';
import { SiteContentProvider } from './Components/SiteContentContext/SiteContentContext';
import { CategoriesProvider } from './Components/CategoriesContext/CategoriesContext';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import DashboardGate from './Components/DashboardGate/DashboardGate';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import RouteError from './Components/RouteError/RouteError';
import { supabaseConfigError } from './supabase/supabase';

const Home = lazy(() => import('./Components/Home/Home'));
const ErrorPage = lazy(() => import('./Components/ErrorPage/ErrorPage'));
const ShopPage = lazy(() => import('./Components/ShopPage/ShopPage'));
const SingleProduct = lazy(() => import('./Components/SingleProduct/SingleProduct'));
const CartPage = lazy(() => import('./Components/CartPage/CartPage'));
const CheckoutPage = lazy(() => import('./Components/CheckoutPage/CheckoutPage'));
const ThankYouPage = lazy(() => import('./Components/ThankYouPage/ThankYouPage'));
const LoginPage = lazy(() => import('./Components/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./Components/RegisterPage/RegisterPage'));
const OrderHistoryPage = lazy(() => import('./Components/OrderHistoryPage/OrderHistoryPage'));
const ContactPage = lazy(() => import('./Components/ContactPage/ContactPage'));
const AboutPage = lazy(() => import('./Components/AboutPage/AboutPage'));
const ForgetPassword = lazy(() => import('./Components/ForgetPassword/ForgetPassword'));
const ResetPasswordPage = lazy(() => import('./Components/ResetPasswordPage/ResetPasswordPage'));
const SearchResultsPage = lazy(() => import('./Components/SearchResultsPage/SearchResultsPage'));
const AccountDetails = lazy(() => import('./Components/AccountDetails/AccountDetails'));
const WishlistPage = lazy(() => import('./Components/WishlistPage/WishlistPage'));

/** Stable router instance — creating this inside App() remounted routes on every render. */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: '/shop', element: <ShopPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/singleproduct/:id', element: <SingleProduct /> },
      { path: '/cart', element: <CartPage /> },
      {
        path: '/checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      { path: '/wishlist', element: <WishlistPage /> },
      {
        path: '/accountdetails',
        element: (
          <ProtectedRoute>
            <AccountDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: '/thankyoupage',
        element: (
          <ProtectedRoute>
            <ThankYouPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orderhistory',
        element: (
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <DashboardGate>
            <AdminDashboard />
          </DashboardGate>
        ),
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgetpassword', element: <ForgetPassword /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/search', element: <SearchResultsPage /> },
      { path: '*', element: <ErrorPage /> },
    ],
  },
]);

export default function App() {
  if (supabaseConfigError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#f6f3ee',
          color: '#1f2a1f',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            Site configuration error
          </h1>
          <p style={{ lineHeight: 1.5, opacity: 0.85 }}>{supabaseConfigError}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <SiteContentProvider>
          <CategoriesProvider>
            <ProductsProvider>
              <WishlistProvider>
                <CartProvider>
                  <ToastContainer
                    position="top-right"
                    autoClose={4500}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    theme="colored"
                  />
                  <RouterProvider router={router} />
                </CartProvider>
              </WishlistProvider>
            </ProductsProvider>
          </CategoriesProvider>
        </SiteContentProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
