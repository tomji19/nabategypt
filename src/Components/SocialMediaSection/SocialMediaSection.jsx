import React from 'react';
import classes from '../SocialMediaSection/SocialMediaSection.module.css';
import socialMediaImage from '../../assets/images/socialmedia.png';

export default function SocialMediaSection() {
  return (
    <section className="px-32 py-7">
      <div className="container mx-auto grid grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center">
          <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
            <button className="text-2xl cursor-pointer shadow-md shadow-transparent transition-all duration-300 hover:bg-indigo-600 hover:text-white p-3">
              <i className="fa-brands fa-facebook"></i>
            </button>
            <button className="text-2xl cursor-pointer shadow-md shadow-transparent transition-all duration-300 hover:bg-pink-600 hover:text-white p-3">
              <i className="fa-brands fa-instagram"></i>
            </button>
            <button className="text-2xl cursor-pointer shadow-md shadow-transparent transition-all duration-300 hover:bg-red-600 hover:text-white p-3">
              <i className="fa-brands fa-youtube"></i>
            </button>
            <button className="text-2xl cursor-pointer shadow-md shadow-transparent transition-all duration-300 hover:bg-green-600 hover:text-white p-3">
              <i className="fa-brands fa-whatsapp"></i>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <img
            src={socialMediaImage}
            alt="Social Media"
            className="w-full h-auto "
          />
        </div>
      </div>
    </section>
  );
}