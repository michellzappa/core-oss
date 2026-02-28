import { countries as countryData } from "./data/countries";

export function getCountryNameAndFlag(code: string) {
  const country = countryData.find((c) => c.code === code);
  return {
    name: country?.name || code,
    flag: getCountryFlag(code),
  };
}

export function getCountryFlag(code: string) {
  if (!code) return '';
  // Special case for Europe (EU) - return EU flag emoji
  if (code.toUpperCase() === 'EU') {
    return '🇪🇺';
  }
  const codePoints = Array.from(code.toUpperCase())
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const countryOptions = countryData.map((country) => ({
  value: country.code,
  label: `${getCountryFlag(country.code)} ${country.name}`,
}));

// Re-export the countries data for convenience
export { countries } from "./data/countries";
export type { Country } from "./data/countries"; 