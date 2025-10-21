import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classes from '../TestimonialSection/TestimonialSection.module.css';

const testimonials = [
  {
    id: 1,
    quote:
      'Et, dignissimos obcaecati. Recusandae praesentium doloribus vitae? Rem unde atque mollitia!',
    name: 'Leroy Jenkins',
    image: 'https://source.unsplash.com/random/100x100?1',
  },
  {
    id: 2,
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam dapibus magna et tristique fermentum.',
    name: 'Sarah Smith',
    image: 'https://source.unsplash.com/random/100x100?2',
  },
  {
    id: 3,
    quote:
      'Nullam scelerisque, lacus sed consequat laoreet, dui enim iaculis leo, eu viverra ex nulla in tellus.',
    name: 'John Doe',
    image: 'https://source.unsplash.com/random/100x100?3',
  },
  {
    id: 4,
    quote:
      'Curabitur auctor, velit ut congue finibus, nisi nulla consectetur purus, eu varius purus est eget nunc.',
    name: 'Emily Johnson',
    image: 'https://source.unsplash.com/random/100x100?4',
  },
];

export default function testimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <h1 className="text-6xl mb-7 text-center relative mt-7">Testimonials</h1>
      <section
        className={`${classes.testimonialbackground} px-32 py-7 relative max-w-7xl mx-auto h-[25rem]`}
      >
        <div className="absolute inset-0 opacity-10"></div>
        <div className="container max-w-6xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center w-full p-6 space-y-8 lg:h-full lg:p-8 dark:text-black"
            >
              <blockquote className="max-w-lg text-2xl italic font-bold text-center">
                "{testimonials[currentIndex].quote}"
              </blockquote>
              <div className="text-center dark:text-black">
                <p>{testimonials[currentIndex].name}</p>
                <img
                  src={testimonials[currentIndex].image}
                  alt=""
                  className="w-20 h-20 rounded-full mt-5 dark:bg-gray-500"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-1/2 -left-36 transform -translate-y-1/2">
            <button
              type="button"
              aria-label="Previous"
              className="text-black text-4xl py-2 px-4 transition-all duration-300"
              onClick={() =>
                handleDotClick(
                  currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1
                )
              }
            >
              <i className="fa-solid fa-chevron-left text-3xl"></i>
            </button>
          </div>
          <div className="absolute top-1/2 -right-36 transform -translate-y-1/2">
            <button
              type="button"
              aria-label="Next"
              className="text-black text-2xl py-2 px-4 transition-all duration-300"
              onClick={() =>
                handleDotClick((currentIndex + 1) % testimonials.length)
              }
            >
              <i className="fa-solid fa-chevron-right text-3xl"></i>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
