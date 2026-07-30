import React from 'react';
import { Link } from 'react-router-dom';
import nabatlogo from '../../assets/images/nabat-logo2.png';

export default function Footer() {
  return (
    <footer className="leaf-wash mt-auto border-t border-nabat-border">
      <div className="section-pad py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <img
            src={nabatlogo}
            alt="Nabat"
            className="mx-auto mb-5 h-14 w-auto object-contain md:h-16"
          />
          <p className="font-heading text-2xl font-medium tracking-tight text-nabat-text md:text-3xl">
            Nabat
          </p>
          <p className="mt-2 font-body text-sm text-nabat-muted">
            Delivering life to your doorstep
          </p>

          <div className="mt-8 flex justify-center gap-2">
            {['facebook', 'instagram', 'youtube', 'whatsapp'].map((network) => (
              <a
                key={network}
                href="#"
                aria-label={network}
                className="flex h-10 w-10 items-center justify-center text-nabat-primary transition-colors hover:bg-nabat-primary hover:text-white"
              >
                <i className={`fa-brands fa-${network}`} />
              </a>
            ))}
          </div>

          <form
            className="mx-auto mt-10 flex max-w-md border border-nabat-border bg-white"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              id="footer_email"
              name="floating_email"
              required
              placeholder="Email for plant tips"
              className="w-full bg-transparent px-4 py-3 font-body text-sm focus:outline-none"
            />
            <button type="submit" className="btn-primary shrink-0 !px-5 !py-3">
              Join
            </button>
          </form>
        </div>

        <div className="mt-14 grid gap-10 border-t border-nabat-border pt-10 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h3 className="section-label !mb-4">Explore</h3>
            <ul className="space-y-2.5 font-nav text-sm text-nabat-muted">
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
            <h3 className="section-label !mb-4">Account</h3>
            <ul className="space-y-2.5 font-nav text-sm text-nabat-muted">
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
            <h3 className="section-label !mb-4">Visit</h3>
            <p className="font-body text-sm leading-relaxed text-nabat-muted">
              Alexandria, Egypt
              <br />
              Plants for modern living
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-nabat-border section-pad py-4">
        <p className="text-center font-nav text-[11px] uppercase tracking-[0.16em] text-nabat-muted">
          © {new Date().getFullYear()} Nabat Egypt
        </p>
      </div>
    </footer>
  );
}
