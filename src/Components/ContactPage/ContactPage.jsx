import React from 'react';
import { Link } from 'react-router-dom';
import pageBanner from '../../assets/images/pagebanner.png';

export default function ContactPage() {
  return (
    <>
      <section className="page-banner min-h-[16rem] md:min-h-[20rem]">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/55" />
        <div className="relative z-10">
          <p className="mb-2 font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
            Reach out
          </p>
          <h1 className="page-banner-title">Contact</h1>
        </div>
      </section>

      <section className="leaf-wash section-pad py-20 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="section-label">Hello</p>
            <h2 className="section-title">We&apos;d love to hear from you</h2>
            <p className="section-subtitle">
              Questions about plants, orders, or care? Send us a note.
            </p>
            <div className="mt-10 space-y-6 font-nav text-sm">
              <div>
                <p className="section-label !mb-1">Location</p>
                <p className="text-nabat-text">Alexandria, Egypt</p>
              </div>
              <div>
                <p className="section-label !mb-1">Email</p>
                <p className="text-nabat-accent">hello@nabat.eg</p>
              </div>
            </div>
            <div className="mt-10 flex gap-2">
              {['facebook', 'instagram', 'whatsapp'].map((n) => (
                <a
                  key={n}
                  href="#"
                  aria-label={n}
                  className="flex h-11 w-11 items-center justify-center border border-nabat-border text-nabat-primary transition-colors hover:bg-nabat-primary hover:text-white"
                >
                  <i className={`fa-brands fa-${n}`} />
                </a>
              ))}
            </div>
          </div>

          <div className="border border-nabat-border bg-white p-8 md:p-10">
            <form
              className="space-y-6"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="section-label !mb-2">Name</label>
                <input type="text" className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label className="section-label !mb-2">Email</label>
                <input type="email" className="input-field" placeholder="Your email" />
              </div>
              <div>
                <label className="section-label !mb-2">Message</label>
                <textarea
                  className="input-field min-h-[8rem] resize-y"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Send message
              </button>
            </form>
            <Link
              to="/shop"
              className="mt-6 block text-center font-nav text-xs uppercase tracking-[0.14em] text-nabat-muted hover:text-nabat-accent"
            >
              Or continue shopping →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
