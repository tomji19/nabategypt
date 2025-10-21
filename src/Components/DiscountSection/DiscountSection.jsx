import React from 'react';
import classes from '../DiscountSection/DiscountSection.module.css';

export default function discountSection() {
  return (
    <>
      <section
        className={`${classes.discountbackground} px-32 mt-7 h-[28rem] relative`}
      >
        <div className="absolute flex flex-col text-start justify-center items-center top-0 bottom-0 left-0 right-0">
          <h1 className="text-4xl mb-5 text-center text-white font-['Raleway']">
            Get 30% Off Your Next Order
          </h1>
          <form className="max-w-md">
            <div className="relative z-0 w-[29rem] group">
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
      </section>
    </>
  );
}
