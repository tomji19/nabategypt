import en from './en';
import ar from './ar';

export const translations = { en, ar };

export function translate(lang, key, vars) {
  const dict = translations[lang] || translations.en;
  let text = dict[key] ?? translations.en[key] ?? key;
  if (vars && typeof text === 'string') {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

export { en, ar };
