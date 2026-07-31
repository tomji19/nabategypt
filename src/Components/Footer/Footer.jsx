import React from 'react';
import { Link } from 'react-router-dom';
import nabatlogo from '../../assets/images/logocolored.png';

export default function Footer() {
  return (
    <footer className="leaf-wash mt-auto border-t border-nabat-border">
      <div className="section-pad py-10 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <img
            src={nabatlogo}
            alt="Nabat"
            className="mx-auto mb-3 h-10 w-auto object-contain md:h-11"
          />
          <p className="font-body text-sm text-nabat-muted">
            Delivering life to your doorstep
          </p>

          <div className="mt-5 flex justify-center gap-1.5">
            {['facebook', 'instagram', 'youtube', 'whatsapp'].map((network) => (
              <a
                key={network}
                href="#"
                aria-label={network}
                className="flex h-9 w-9 items-center justify-center text-nabat-primary transition-colors hover:bg-nabat-primary hover:text-white"
              >
                <i className={`fa-brands fa-${network}`} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-nabat-border pt-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h3 className="section-label !mb-3">Explore</h3>
            <ul className="space-y-2 font-nav text-sm text-nabat-muted">
              <li>
                <Link to="/about" className="hover:text-nabat-primary">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-nabat-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-nabat-primary">
                  Shop
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-nabat-primary">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div className="sm:text-center">
            <h3 className="section-label !mb-3">Account</h3>
            <ul className="space-y-2 font-nav text-sm text-nabat-muted">
              <li>
                <Link to="/accountdetails" className="hover:text-nabat-primary">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-nabat-primary">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-nabat-primary">
                  Checkout
                </Link>
              </li>
              <li>
                <Link to="/orderhistory" className="hover:text-nabat-primary">
                  Order History
                </Link>
              </li>
            </ul>
          </div>
          <div className="sm:col-span-2 md:col-span-1 md:text-right">
            <h3 className="section-label !mb-3">Visit</h3>
            <p className="font-body text-sm leading-relaxed text-nabat-muted">
              Alexandria, Egypt
              <br />
              Plants for modern living
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-nabat-border section-pad py-3">
        <a
          href="https://youssefashour.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted transition-colors hover:text-nabat-primary"
        >
          © 2020–{new Date().getFullYear()} Nabat Egypt · All rights reserved · Designed
          and Developed by Youssef Ashour
        </a>
      </div>
    </footer>
  );
}
