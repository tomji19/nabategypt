import React from 'react';
import socialMediaImage from '../../assets/images/socialmedia.png';

export default function SocialMediaSection() {
  return (
    <section className="grid md:grid-cols-2">
      <div className="leaf-wash section-pad flex flex-col justify-center py-16 md:py-24">
        <p className="section-label">Community</p>
        <h2 className="section-title">Follow the greenhouse</h2>
        <p className="section-subtitle">
          Care tips, new arrivals, and plant stories from Nabat
        </p>
        <div className="mt-10 flex gap-2">
          {['facebook', 'instagram', 'youtube', 'whatsapp'].map((n) => (
            <a
              key={n}
              href="#"
              aria-label={n}
              className="flex h-12 w-12 items-center justify-center border border-nabat-border text-nabat-primary transition-colors hover:border-nabat-primary hover:bg-nabat-primary hover:text-white"
            >
              <i className={`fa-brands fa-${n}`} />
            </a>
          ))}
        </div>
      </div>
      <div className="relative min-h-[18rem] md:min-h-full">
        <img
          src={socialMediaImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
