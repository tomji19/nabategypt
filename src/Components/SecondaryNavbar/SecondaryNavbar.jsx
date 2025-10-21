import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classes from '../SecondaryNavbar/SecondaryNavbar.module.css';
import { useCart } from '../CartContext/CartContext';
import { useAuth } from '../AuthContext/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

export default function SecondaryNavbar() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { 
    currentUser, 
    userDetails, 
    userLoggedIn, 
    anonymousUserName 
  } = useAuth();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('guestCart');

      // Clear cart
      clearCart();

      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (!userLoggedIn) return null;

    // Priority: 
    // 1. Anonymous user name
    // 2. User's name from Firestore
    // 3. User's display name from Firebase
    // 4. User's email
    // 5. 'Guest' for anonymous users
    if (anonymousUserName) return anonymousUserName;
    if (userDetails?.name) return userDetails.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Guest';
  };

  const displayName = getUserDisplayName();

  return (
    <section className={`${classes.mainSection} px-32 py-4`}>
      <div className="flex justify-between">
        <div className="w-[50%]">
          <h3 className="text-[1.1rem] font-bold">Get 30% off your first order</h3>
        </div>
        <div className="flex justify-end w-[50%]">
          {userLoggedIn ? (
            <div className="flex items-center">
              <h3 className="text-[1.2rem] mr-4">
                Hello, {displayName}
              </h3>
              <h3 
                className="text-[1.2rem] cursor-pointer hover:text-[#c9c9c9] transition-colors"
                onClick={handleLogout}
              >
                Logout
              </h3>
            </div>
          ) : (
            <>
              <h3 className="text-[1.2rem]">
                <Link to="/login">Login</Link>
              </h3>
              <span className="mx-2 font-extrabold">|</span>
              <h3 className="text-[1.2rem]">
                <Link to="/register">Register</Link>
              </h3>
            </>
          )}
        </div>
      </div>
    </section>
  );
}