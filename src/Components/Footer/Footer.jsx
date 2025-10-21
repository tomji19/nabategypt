import React from 'react';
import classes from '../Footer/Footer.module.css';
import nabatlogo from '../../assets/images/nabat-logo2.png';

export default function footer() {
  return (
    <>
      <footer className="bg-[var(--main-color)] text-white py-12 px-32">
        <div className="container mx-auto flex gap-8">
          {/* Left Column */}
          <div className="space-y-4 w-[25%] flex flex-col justify-center">
            <h3 className="text-3xl font-bold">Information</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Wishlist
                </a>
              </li>
            </ul>
          </div>

          {/* Middle Column */}
          <div className="space-y-4 relative flex flex-col items-center justify-center w-[50%]">
            <img src={nabatlogo} alt="Logo" className="w-[8rem]" />
            <p className="text-gray-300 font-medium">
              Delivering life to your doortstep
            </p>
            <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
              <button className="text-white cursor-pointer shadow-md shadow-transparent transition-all duration-300 hover:bg-indigo-600 hover:text-white p-3">
                <i className="fa-brands fa-facebook"></i>
              </button>
              <button className="text-white cursor-pointer shadow-md shadow-transparent transition-all duration-300 hover:bg-pink-600 hover:text-white p-3">
                <i className="fa-brands fa-instagram"></i>
              </button>
              <button className="text-white cursor-pointer shadow-md shadow-transparent transition-all duration-300 hover:bg-red-600 hover:text-white p-3">
                <i className="fa-brands fa-youtube"></i>
              </button>
              <button className="text-white cursor-pointer shadow-md shadow-transparent transition-all duration-300 hover:bg-green-600 hover:text-white p-3">
                <i className="fa-brands fa-whatsapp"></i>
              </button>
              <form className="max-w-md">
                <div className="relative z-0 w-[24rem] group">
                  <input
                    type="email"
                    name="floating_email"
                    id="floating_email"
                    className="block py-2.5 pl-2 pr-[5rem] w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-white appearance-none dark:text-white dark:border-white dark:focus:border-white focus:outline-none focus:ring-0 focus:border-white peer"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="floating_email"
                    className="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Email address
                  </label>
                  <button
                    type="submit"
                    className="absolute right-0 top-0 py-2 px-4 bg-black border border-black text-white"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 w-[25%] flex flex-col justify-center">
            <h3 className="text-3xl font-bold">My Account</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  My Account
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Cart
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Checkout
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Order History
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
