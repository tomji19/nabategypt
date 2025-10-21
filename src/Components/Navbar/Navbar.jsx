import React, { useState } from 'react';
import logoNoBackground from '../../assets/images/logocolored.png';
import '@fortawesome/fontawesome-free/css/all.css';
import cartIcon from '../../assets/images/cart.svg';
import userIcon from '../../assets/images/user.svg';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <section className="px-32 py-14">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="w-[35%] flex justify-center">
          <Link to="/">
            <img
              className="w-[50%]"
              src={logoNoBackground}
              alt="Nabat Egypt no background image"
            />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-[100%] flex items-center">
          <form onSubmit={handleSearch} className="w-full">
            <div className="flex text-black">
              <div className="relative w-full">
                <input
                  type="search"
                  id="search-dropdown"
                  className="block p-2.5 w-full z-20 text-sm text-black bg-gray-50 border"
                  placeholder="Search..."
                  required
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-[var(--main-color)] border border-[var(--main-color)] hover:bg-[var(--main-color)] focus:ring-4 focus:outline-none"
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                  <span className="sr-only">Search</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Navigation Icons */}
        <div className="w-[30%] flex justify-end items-center relative">
          <img
            className="w-[20%] pr-3 cursor-pointer"
            onClick={() => navigate('/accountdetails')}
            src={userIcon}
            alt="Account icon in the second nav header"
          />
          <img
            className="w-[20%] pr-3 cursor-pointer"
            src={cartIcon}
            alt="Cart icon in the second nav header"
            onClick={() => navigate('/cart')}
          />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-1 bg-red-600 text-white font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
