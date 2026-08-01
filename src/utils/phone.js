import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

/** Display names for the country picker (ISO 3166-1 alpha-2). */
const COUNTRY_NAMES = {
  EG: 'Egypt',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  KW: 'Kuwait',
  QA: 'Qatar',
  BH: 'Bahrain',
  OM: 'Oman',
  JO: 'Jordan',
  LB: 'Lebanon',
  IQ: 'Iraq',
  MA: 'Morocco',
  DZ: 'Algeria',
  TN: 'Tunisia',
  LY: 'Libya',
  SD: 'Sudan',
  TR: 'Turkey',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  CA: 'Canada',
  AU: 'Australia',
  IN: 'India',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  PH: 'Philippines',
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  RU: 'Russia',
  BR: 'Brazil',
  ZA: 'South Africa',
  NG: 'Nigeria',
  KE: 'Kenya',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  CH: 'Switzerland',
  AT: 'Austria',
  PL: 'Poland',
  PT: 'Portugal',
  GR: 'Greece',
  IE: 'Ireland',
  NZ: 'New Zealand',
  SG: 'Singapore',
  MY: 'Malaysia',
  ID: 'Indonesia',
  TH: 'Thailand',
  VN: 'Vietnam',
};

const PRIORITY = ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'US', 'GB'];

function buildCountryOptions() {
  const all = getCountries();
  const named = all
    .map((code) => ({
      code,
      dial: `+${getCountryCallingCode(code)}`,
      name: COUNTRY_NAMES[code] || code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const prioritySet = new Set(PRIORITY);
  const top = PRIORITY.map((code) => named.find((c) => c.code === code)).filter(
    Boolean
  );
  const rest = named.filter((c) => !prioritySet.has(c.code));
  return [...top, ...rest];
}

export const PHONE_COUNTRIES = buildCountryOptions();

/** Digits only; drop leading country dial / trunk 0 for local entry. */
function nationalDigits(countryCode, nationalNumber) {
  const dial = getCountryCallingCode(countryCode);
  let digits = String(nationalNumber || '').replace(/\D/g, '');
  if (digits.startsWith(dial)) digits = digits.slice(dial.length);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

/**
 * Egyptian mobiles (checkout): +20 + 10 digits starting 10/11/12/15.
 * libphonenumber accepts short EG landlines (8–9); we reject those.
 */
function isEgyptianMobile(nationalNumber) {
  const digits = nationalDigits('EG', nationalNumber);
  return /^(10|11|12|15)\d{8}$/.test(digits);
}

export function toE164(countryCode, nationalNumber) {
  const raw = String(nationalNumber || '').trim();
  if (!raw) return '';

  if (countryCode === 'EG') {
    const digits = nationalDigits('EG', raw);
    if (/^(10|11|12|15)\d{8}$/.test(digits)) return `+20${digits}`;
  }

  // Already international
  if (raw.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(raw);
    return parsed?.number || raw;
  }

  const parsed = parsePhoneNumberFromString(raw, countryCode);
  if (parsed) return parsed.number;

  const dial = getCountryCallingCode(countryCode);
  const digits = raw.replace(/\D/g, '').replace(new RegExp(`^${dial}`), '');
  return `+${dial}${digits}`;
}

export function isPhoneValidForCountry(countryCode, nationalNumber) {
  const raw = String(nationalNumber || '').trim();
  if (!raw) return false;

  if (countryCode === 'EG') {
    return isEgyptianMobile(raw);
  }

  if (raw.startsWith('+')) {
    return isValidPhoneNumber(raw);
  }
  return isValidPhoneNumber(raw, countryCode);
}

export function formatNationalHint(countryCode) {
  if (countryCode === 'EG') return '10 1234 5678';
  if (countryCode === 'US' || countryCode === 'CA') return '201 555 0123';
  if (countryCode === 'GB') return '7400 123456';
  if (countryCode === 'SA') return '50 123 4567';
  if (countryCode === 'AE') return '50 123 4567';
  return 'Phone number';
}

/**
 * Split a stored phone (E.164, national, or with leading 0) into form fields.
 * Defaults to Egypt when parsing fails.
 */
export function splitPhoneForForm(storedPhone) {
  const raw = String(storedPhone || '').trim();
  if (!raw) return { country: 'EG', national: '' };

  const parsed = raw.startsWith('+')
    ? parsePhoneNumberFromString(raw)
    : parsePhoneNumberFromString(raw, 'EG');

  if (parsed?.country && parsed.nationalNumber) {
    return {
      country: parsed.country,
      national: parsed.nationalNumber,
    };
  }

  // Egyptian mobile stored without +
  const digits = nationalDigits('EG', raw);
  if (/^(10|11|12|15)\d{8}$/.test(digits)) {
    return { country: 'EG', national: digits };
  }

  return { country: 'EG', national: raw.replace(/\D/g, '') };
}
