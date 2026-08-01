import React from 'react';
import {
  PHONE_COUNTRIES,
  formatNationalHint,
  toE164,
} from '../../utils/phone';
import styles from './PhoneInput.module.css';

/**
 * Country code + national number. Writes:
 * - phoneCountry (ISO)
 * - phoneNational (local digits / spacing)
 * - phone (E.164) for submit / backend
 */
export default function PhoneInput({
  country,
  national,
  onCountryChange,
  onNationalChange,
  onBlur,
  error,
  touched,
  id = 'phone',
}) {
  const dial =
    PHONE_COUNTRIES.find((c) => c.code === country)?.dial || '+20';

  const handleNational = (value) => {
    // Allow digits, spaces, dashes, parentheses; strip letters
    const cleaned = value.replace(/[^\d\s\-()+]/g, '');
    onNationalChange(cleaned);
  };

  return (
    <div className={styles.wrap} dir="ltr">
      <div className={`${styles.row} ${touched && error ? styles.rowError : ''}`}>
        <label className={styles.countryLabel} htmlFor={`${id}-country`}>
          <span className={styles.srOnly}>Country code</span>
          <select
            id={`${id}-country`}
            className={styles.country}
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            onBlur={onBlur}
            aria-label="Country code"
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.dial})
              </option>
            ))}
          </select>
        </label>

        <div className={styles.nationalWrap}>
          <span className={styles.dialPrefix} aria-hidden>
            {dial}
          </span>
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            className={styles.national}
            placeholder={formatNationalHint(country)}
            value={national}
            onChange={(e) => handleNational(e.target.value)}
            onBlur={onBlur}
            maxLength={country === 'EG' ? 11 : 16}
            aria-invalid={Boolean(touched && error)}
            aria-describedby={touched && error ? `${id}-error` : undefined}
          />
        </div>
      </div>

      {touched && error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}

      <p className={styles.hint}>
        Full number:{' '}
        <span>
          {national.trim()
            ? toE164(country, national) || `${dial} …`
            : `${dial} …`}
        </span>
      </p>
    </div>
  );
}
