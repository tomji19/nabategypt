import React, { lazy } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './Components/CartContext/CartContext';
import { AuthProvider } from './Components/AuthContext/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

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
const SearchResultsPage = lazy(() => import('./Components/SearchResultsPage/SearchResultsPage'));
const AccountDetails = lazy(() => import('./Components/AccountDetails/AccountDetails'));

export default function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: '/shop', element: <ShopPage /> },
        { path: '/contact', element: <ContactPage /> },
        { path: '/about', element: <AboutPage /> },
        { path: '/singleproduct/:id', element: <SingleProduct /> },
        { path: '/cart', element: <CartPage /> },
        { path: '/checkout', element: <CheckoutPage /> },
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
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
        { path: '/forgetpassword', element: <ForgetPassword /> },
        { path: '/search', element: <SearchResultsPage /> },
        { path: '*', element: <ErrorPage /> },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <CartProvider>
        <ToastContainer />
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}
