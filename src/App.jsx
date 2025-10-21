import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Components/Home/Home';
import Layout from './Components/Layout/Layout';
import ErrorPage from './Components/ErrorPage/ErrorPage';
import ShopPage from './Components/ShopPage/ShopPage';
import SingleProduct from './Components/SingleProduct/SingleProduct';
import CartPage from './Components/CartPage/CartPage';
import CheckoutPage from './Components/CheckoutPage/CheckoutPage';
import ThankYouPage from './Components/ThankYouPage/ThankYouPage';
import LoginPage from './Components/LoginPage/LoginPage';
import RegisterPage from './Components/RegisterPage/RegisterPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './Components/CartContext/CartContext';
import { AuthProvider } from './Components/AuthContext/AuthContext';
import OrderHistoryPage from './Components/OrderHistoryPage/OrderHistoryPage';
import ContactPage from './Components/ContactPage/ContactPage';
import AboutPage from './Components/AboutPage/AboutPage';
import ForgetPassword from './Components/ForgetPassword/ForgetPassword';
import SearchResultsPage from './Components/SearchResultsPage/SearchResultsPage';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import AccountDetails from './Components/AccountDetails/AccountDetails';

export default function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: '/shop',
          element: <ShopPage />,
        },
        {
          path: '/contact',
          element: <ContactPage />,
        },
        {
          path: '/about',
          element: <AboutPage />,
        },
        {
          path: '/singleproduct/:id',
          element: <SingleProduct />,
        },
        {
          path: '/cart',
          element: <CartPage />,
        },
        {
          path: '/checkout',
          element: <CheckoutPage />,
        },
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
          path: '/login',
          element: <LoginPage />,
        },
        {
          path: '/register',
          element: <RegisterPage />,
        },
        {
          path: '/forgetpassword',
          element: <ForgetPassword />,
        },
        {
          path: '/search',
          element: <SearchResultsPage />,
        },
        {
          path: '*',
          element: <ErrorPage />,
        },
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
