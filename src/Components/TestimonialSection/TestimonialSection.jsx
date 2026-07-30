import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    quote:
      'Et, dignissimos obcaecati. Recusandae praesentium doloribus vitae? Rem unde atque mollitia!',
    name: 'Leroy Jenkins',
  },
  {
    id: 2,
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam dapibus magna et tristique fermentum.',
    name: 'Sarah Smith',
  },
  {
    id: 3,
    quote:
      'Nullam scelerisque, lacus sed consequat laoreet, dui enim iaculis leo, eu viverra ex nulla in tellus.',
    name: 'John Doe',
  },
  {
    id: 4,
    quote:
      'Curabitur auctor, velit ut congue finibus, nisi nulla consectetur purus, eu varius purus est eget nunc.',
    name: 'Emily Johnson',
  },
];

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-pad bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-label">Words from growers</p>
        <div className="relative mt-10 min-h-[14rem]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={currentIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
              className="font-heading text-[clamp(1.5rem,3.5vw,2.25rem)] font-medium italic leading-snug tracking-tight text-nabat-text"
            >
              &ldquo;{testimonials[currentIndex].quote}&rdquo;
              <footer className="mt-8 not-italic">
                <cite className="font-nav text-xs font-semibold uppercase tracking-[0.2em] text-nabat-accent not-italic">
                  {testimonials[currentIndex].name}
                </cite>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label="Previous"
            className="text-nabat-muted transition-colors hover:text-nabat-primary"
            onClick={() =>
              setCurrentIndex((i) =>
                i > 0 ? i - 1 : testimonials.length - 1
              )
            }
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-nabat-accent' : 'bg-nabat-border'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next"
            className="text-nabat-muted transition-colors hover:text-nabat-primary"
            onClick={() =>
              setCurrentIndex((i) => (i + 1) % testimonials.length)
            }
          >
            <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </div>
    </section>
  );
}
