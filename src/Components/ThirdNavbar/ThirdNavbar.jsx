import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import classes from '../ThirdNavbar/ThirdNavbar.module.css';

export default function ThirdNavbar() {
  const [isSticky, setIsSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      className={`bg-gray-100 px-32 transition-all duration-300 ${
        isSticky ? 'sticky top-0 shadow-md bg-gray-50 z-50 py-6' : 'py-4'
      }`}
    >
      <div className="flex justify-between items-center">
        {/* Categories Button */}
        <div className="w-[25%] relative">
          <ul>
            <li
              className={`text-2xl font-medium p-4 ${classes.categoriesButton} cursor-pointer`}
              onClick={toggleDropdown}
            >
              <i className="fa-solid fa-bars pr-5 text-white"></i>All Categories
            </li>
          </ul>
          {isDropdownOpen && (
            <ul className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-200 z-10">
              {['Succulents', 'Indoor Plants', 'Outdoor Plants', 'Pots', 'Care Tools'].map(
                (category, index) => (
                  <li
                    key={index}
                    className="p-3 text-black hover:opacity-70 cursor-pointer"
                  >
                    <NavLink to={`/category/${category.toLowerCase().replace(' ', '-')}`}>
                      {category}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          )}
        </div>

        {/* Navigation Links */}
        <div className={`flex justify-between items-center w-[75%]`}>
          <ul className={`flex items-center font-bold`}>
            <li className="pl-10">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'text-[var(--main-color)] text-[1.3rem]' : ''
                }
              >
                Home
              </NavLink>
            </li>

            <li className="pl-10">
              <NavLink
                to="shop"
                className={({ isActive }) =>
                  isActive ? 'text-[var(--main-color)] text-[1.3rem]' : ''
                }
              >
                Shop
              </NavLink>
            </li>

            <li className="pl-10">
              <NavLink
                to="contact"
                className={({ isActive }) =>
                  isActive ? 'text-[var(--main-color)] text-[1.3rem]' : ''
                }
              >
                Contact
              </NavLink>
            </li>

            <li className="pl-10">
              <NavLink
                to="about"
                className={({ isActive }) =>
                  isActive ? 'text-[var(--main-color)] text-[1.3rem]' : ''
                }
              >
                About
              </NavLink>
            </li>
          </ul>

          {/* Sticky Search Bar */}
          {isSticky && (
            <form onSubmit={handleSearch} className="ml-auto">
              <div className="relative flex items-center">
                <input
                  type="search"
                  id="sticky-search"
                  className="block p-2.5 text-sm text-black bg-gray-50 border w-[25rem]"
                  placeholder="Search..."
                  required
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute top-0 right-0 p-2.5 text-sm font-medium h-full text-white bg-[var(--main-color)] border border-[var(--main-color)] hover:bg-[var(--main-color)] focus:ring-4 focus:outline-none"
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
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
