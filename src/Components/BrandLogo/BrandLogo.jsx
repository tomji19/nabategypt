import React from 'react';
import { Link } from 'react-router-dom';
import logoColored from '../../assets/images/logocolored.png';
import logoProfile from '../../assets/images/nabat-profile.png';

const VARIANTS = {
  /** Main green wordmark — navbar, footer, auth panels */
  mark: logoColored,
  /** Circular / profile mark — thank-you, compact seals */
  seal: logoProfile,
};

/**
 * Official نبات brand mark. Prefer this over writing "نبات" / "Nabat" as text.
 */
export default function BrandLogo({
  variant = 'mark',
  to = null,
  className = '',
  imgClassName = 'h-10 w-auto object-contain',
  onClick,
}) {
  const src = VARIANTS[variant] || VARIANTS.mark;
  const img = (
    <img
      src={src}
      alt=""
      className={imgClassName}
      decoding="async"
    />
  );

  if (to) {
    return (
      <Link to={to} className={`inline-flex items-center ${className}`} onClick={onClick}>
        {img}
      </Link>
    );
  }

  return <span className={`inline-flex items-center ${className}`}>{img}</span>;
}
