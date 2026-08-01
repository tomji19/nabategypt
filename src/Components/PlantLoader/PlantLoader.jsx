import React, { useEffect } from 'react';
import styles from './PlantLoader.module.css';
import { lockBodyScroll, unlockBodyScroll, scrollWindowToTop } from '../../utils/scrollLock';

/**
 * Very simple sprout animation for page / data loading.
 * @param {'page' | 'inline' | 'overlay'} [variant='page']
 * @param {boolean} [lockScroll] — defaults to true for page/overlay
 */
export default function PlantLoader({ variant = 'page', lockScroll }) {
  const shouldLock =
    typeof lockScroll === 'boolean'
      ? lockScroll
      : variant === 'overlay' || variant === 'page';

  useEffect(() => {
    if (!shouldLock) return undefined;

    scrollWindowToTop();
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [shouldLock]);

  const sprout = (
    <div className={styles.sprout} aria-hidden>
      <svg className={styles.svg} viewBox="0 0 48 56" fill="none">
        <path
          className={styles.stem}
          d="M24 50 V22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className={styles.leafLeft}
          d="M24 34 C14 32 10 24 12 16 C18 18 24 24 24 34Z"
          fill="currentColor"
        />
        <path
          className={styles.leafRight}
          d="M24 30 C34 28 38 20 36 12 C30 14 24 20 24 30Z"
          fill="currentColor"
        />
      </svg>
      <p className={styles.label}>Growing…</p>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={styles.inline} role="status" aria-live="polite">
        {sprout}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={styles.overlay} role="status" aria-live="polite" aria-busy="true">
        {sprout}
      </div>
    );
  }

  return (
    <div className={styles.page} role="status" aria-live="polite" aria-busy="true">
      {sprout}
    </div>
  );
}
