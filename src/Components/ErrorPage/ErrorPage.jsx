import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo/BrandLogo';

export default function ErrorPage() {
  return (
    <section className="leaf-wash section-pad flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <BrandLogo
        className="mb-10 opacity-80"
        imgClassName="h-12 w-auto object-contain"
      />
      <p className="font-heading text-[clamp(4rem,12vw,8rem)] font-medium leading-none tracking-tight text-nabat-mist">
        404
      </p>
      <h1 className="mt-6 font-heading text-2xl font-medium text-nabat-text md:text-3xl">
        This path has no plants
      </h1>
      <p className="mt-3 max-w-sm font-body text-nabat-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-10">
        Back to home
      </Link>
    </section>
  );
}
