import React from 'react';
import classes from '../HeroSection/HeroSection.module.css';


export default function heroSection() {
  return (
    <section className=" px-32 py-7">
      <div className="flex justify-between">
        {/* Left Section */}
        <div
          className={`${classes.backgroundImageMain} p-6 relative h-[36rem] w-[52rem] flex items-center`}
        >
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex flex-col justify-center text-left">
            <h2 className="text-7xl text-white font-bold">Nabat Egypt</h2>
            <p className="text-2xl text-white my-2">
              Delivering life to your doorstep
            </p>
            <a
              href="#_"
              className="relative w-[55%] inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out group"
            >
              <span className="absolute bottom-0 left-0 w-[50%] h-1 transition-all duration-150 ease-in-out bg-[var(--main-color)] group-hover:h-full"></span>
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-0">
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-0 group-hover:translate-x-0 ease-out duration-200">
              </span>
              <span className="relative text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                Shop Now
              </span>
            </a>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/3 flex flex-col space-y-4">
          <div
            className={`${classes.backgroundImagetwo} p-6 flex justify-between items-center relative h-[17.5rem]`}
          >
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h3 className="text-5xl mb-2 text-white font-bold">New Arrivals</h3>
              <a
              href="#_"
              className="relative w-[80%] inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out group"
            >
              <span className="absolute bottom-0 left-0 w-[50%] h-1 transition-all duration-150 ease-in-out bg-[var(--main-color)] group-hover:h-full"></span>
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-0">
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-0 group-hover:translate-x-0 ease-out duration-200">
              </span>
              <span className="relative text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                Shop Now
              </span>
            </a>
            </div>
          </div>

          <div
            className={`${classes.backgroundImagethree} p-6 flex justify-between items-center relative h-[17.5rem]`}
          >
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h3 className="text-5xl mb-2 text-white font-bold">Best Selling</h3>
              <a
              href="#_"
              className="relative w-[80%] inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out group"
            >
              <span className="absolute bottom-0 left-0 w-[50%] h-1 transition-all duration-150 ease-in-out bg-[var(--main-color)] group-hover:h-full"></span>
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-0">
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-0 group-hover:translate-x-0 ease-out duration-200">
              </span>
              <span className="relative text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                Shop Now
              </span>
            </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
