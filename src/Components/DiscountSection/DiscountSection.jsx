import React from 'react';
import discountImage from '../../assets/images/discount.png';

export default function DiscountSection() {
  return (
    <section className="relative flex min-h-[28rem] items-center justify-center overflow-hidden md:min-h-[32rem]">
      <img
        src={discountImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-nabat-primary/70" />
      <div className="relative z-10 section-pad mx-auto max-w-xl py-20 text-center">
        <p className="mb-4 font-nav text-[11px] font-semibold uppercase tracking-[0.22em] text-nabat-mist">
          Offer
        </p>
        <h2 className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-medium tracking-tight text-white">
          Get 30% off your next order
        </h2>
        <form
          className="mx-auto mt-10 flex max-w-md border border-white/40"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            id="discount_email"
            name="floating_email"
            required
            placeholder="Your email"
            className="w-full bg-transparent px-4 py-3.5 font-body text-sm text-white placeholder:text-white/55 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 bg-white px-6 py-3.5 font-nav text-[11px] font-semibold uppercase tracking-[0.14em] text-nabat-primary transition-colors hover:bg-nabat-mist"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
