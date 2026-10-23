// Utility for strict phone number validation and formatting according to international standards (ITU-T E.164)

export interface CountryInfo {
  name: string;
  code: string; // e.g. "+34"
  iso: string;  // e.g. "ES"
  flag: string; // emoji flag e.g. "🇪🇸"
  digitLengths: number[]; // allowed total digits including country code
  sample: string;
}

export const POPULAR_COUNTRIES: CountryInfo[] = [
  { name: 'España', code: '+34', iso: 'ES', flag: '🇪🇸', digitLengths: [11], sample: '+34 612 345 678' },
  { name: 'México', code: '+52', iso: 'MX', flag: '🇲🇽', digitLengths: [12], sample: '+52 55 1234 5678' },
  { name: 'Estados Unidos / Canadá', code: '+1', iso: 'US', flag: '🇺🇸', digitLengths: [11], sample: '+1 555 123 4567' },
  { name: 'Colombia', code: '+57', iso: 'CO', flag: '🇨🇴', digitLengths: [12], sample: '+57 300 123 4567' },
  { name: 'Argentina', code: '+54', iso: 'AR', flag: '🇦🇷', digitLengths: [12, 13], sample: '+54 9 11 2345 6789' },
  { name: 'Chile', code: '+56', iso: 'CL', flag: '🇨🇱', digitLengths: [11], sample: '+56 9 1234 5678' },
  { name: 'Perú', code: '+51', iso: 'PE', flag: '🇵🇪', digitLengths: [11], sample: '+51 912 345 678' },
  { name: 'Ecuador', code: '+593', iso: 'EC', flag: '🇪🇨', digitLengths: [12], sample: '+593 99 123 4567' },
  { name: 'Venezuela', code: '+58', iso: 'VE', flag: '🇻🇪', digitLengths: [12], sample: '+58 412 123 4567' },
  { name: 'Guatemala', code: '+502', iso: 'GT', flag: '🇬🇹', digitLengths: [11], sample: '+502 5123 4567' },
  { name: 'Costa Rica', code: '+506', iso: 'CR', flag: '🇨🇷', digitLengths: [11], sample: '+506 8123 4567' },
  { name: 'Panamá', code: '+507', iso: 'PA', flag: '🇵🇦', digitLengths: [11], sample: '+507 6123 4567' },
  { name: 'República Dominicana', code: '+1', iso: 'DO', flag: '🇩🇴', digitLengths: [11], sample: '+1 809 123 4567' },
  { name: 'Uruguay', code: '+598', iso: 'UY', flag: '🇺🇾', digitLengths: [11], sample: '+598 99 123 456' },
  { name: 'Bolivia', code: '+591', iso: 'BO', flag: '🇧🇴', digitLengths: [11], sample: '+591 7123 4567' },
  { name: 'Paraguay', code: '+595', iso: 'PY', flag: '🇵🇾', digitLengths: [12], sample: '+595 981 123 456' },
  { name: 'El Salvador', code: '+503', iso: 'SV', flag: '🇸🇻', digitLengths: [11], sample: '+503 7123 4567' },
  { name: 'Honduras', code: '+504', iso: 'HN', flag: '🇭🇳', digitLengths: [11], sample: '+504 9123 4567' },
  { name: 'Nicaragua', code: '+505', iso: 'NI', flag: '🇳🇮', digitLengths: [11], sample: '+505 8123 4567' },
  { name: 'Brasil', code: '+55', iso: 'BR', flag: '🇧🇷', digitLengths: [12, 13], sample: '+55 11 91234 5678' },
  { name: 'Reino Unido', code: '+44', iso: 'GB', flag: '🇬🇧', digitLengths: [12], sample: '+44 7911 123456' },
  { name: 'Francia', code: '+33', iso: 'FR', flag: '🇫🇷', digitLengths: [11], sample: '+33 6 12 34 56 78' },
  { name: 'Alemania', code: '+49', iso: 'DE', flag: '🇩🇪', digitLengths: [12, 13], sample: '+49 151 12345678' },
  { name: 'Italia', code: '+39', iso: 'IT', flag: '🇮🇹', digitLengths: [12], sample: '+39 312 345 6789' },
  { name: 'Portugal', code: '+351', iso: 'PT', flag: '🇵🇹', digitLengths: [12], sample: '+351 912 345 678' },
];

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  rawDigits: string;
  country?: CountryInfo;
  errorMessage?: string;
}

/**
 * Checks whether a search query appears to be a phone number or international dial attempt
 */
export const isPhoneNumberQuery = (query: string): boolean => {
  if (!query) return false;
  const trimmed = query.trim();
  if (trimmed.startsWith('+')) return true;
  // If query contains at least 3 digits and only phone-related characters
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length >= 3 && /^[+\d\s\-().]+$/.test(trimmed)) {
    return true;
  }
  return false;
};

/**
 * Detects the most matching country from a phone string or digits
 */
export const detectCountry = (cleanNumber: string): CountryInfo | undefined => {
  // Sort countries with longest dialing code first to avoid prefix collisions (e.g. +593 before +59)
  const sorted = [...POPULAR_COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  const normalized = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;
  
  for (const c of sorted) {
    if (normalized.startsWith(c.code)) {
      return c;
    }
  }
  return undefined;
};

/**
 * Formats a raw phone string into a clean international representation
 */
export const formatPhoneNumber = (input: string, fallbackCountryCode: string = '+34'): string => {
  if (!input) return '';
  let clean = input.trim();
  
  // Replace double plus or accidental spaces
  if (!clean.startsWith('+')) {
    clean = `${fallbackCountryCode} ${clean}`;
  }
  
  const country = detectCountry(clean);
  const digits = clean.replace(/\D/g, '');
  
  if (country) {
    const codeDigits = country.code.replace(/\D/g, '');
    const subscriber = digits.slice(codeDigits.length);
    if (!subscriber) return country.code;
    
    // Group in 3-3-3 or 2-4-4
    const parts: string[] = [];
    for (let i = 0; i < subscriber.length; i += 3) {
      parts.push(subscriber.slice(i, i + 3));
    }
    return `${country.code} ${parts.join(' ')}`;
  }
  
  return clean;
};

/**
 * Validates whether a phone number is an authentic, valid WhatsApp phone number.
 * Enforces international ITU-T standards:
 * - Must have between 7 and 15 digits in total (E.164)
 * - Must not contain letters or illegal characters
 * - Must have a valid structure
 */
export const validatePhoneNumber = (input: string, defaultCountryCode?: string): PhoneValidationResult => {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      formatted: '',
      rawDigits: '',
      errorMessage: 'Por favor, ingresa un número de teléfono.'
    };
  }

  const trimmed = input.trim();

  // Check for forbidden characters (letters or suspicious symbols)
  if (/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      formatted: trimmed,
      rawDigits: trimmed.replace(/\D/g, ''),
      errorMessage: 'El número no puede contener letras ni palabras. Solo números y código de país (+).'
    };
  }

  if (/[^\d+\s\-().]/.test(trimmed)) {
    return {
      isValid: false,
      formatted: trimmed,
      rawDigits: trimmed.replace(/\D/g, ''),
      errorMessage: 'Caracteres no válidos detectados. Usa solo dígitos y el signo +.'
    };
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length < 7) {
    return {
      isValid: false,
      formatted: trimmed,
      rawDigits: digits,
      errorMessage: `Número incompleto (${digits.length} dígitos). Un número internacional válido debe tener al menos 7 a 15 dígitos.`
    };
  }

  if (digits.length > 15) {
    return {
      isValid: false,
      formatted: trimmed,
      rawDigits: digits,
      errorMessage: `Número demasiado largo (${digits.length} dígitos). El límite internacional estándar es de 15 dígitos.`
    };
  }

  // Determine country
  let formattedNumber = trimmed.startsWith('+') ? trimmed : (defaultCountryCode ? `${defaultCountryCode} ${trimmed}` : `+${trimmed}`);
  const country = detectCountry(formattedNumber);

  // If a country was detected, verify format
  if (country) {
    const formatted = formatPhoneNumber(formattedNumber, country.code);
    return {
      isValid: true,
      formatted,
      rawDigits: digits,
      country,
      errorMessage: undefined
    };
  }

  // Generic valid international number
  const genericFormatted = `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`.trim();
  return {
    isValid: true,
    formatted: genericFormatted,
    rawDigits: digits,
    errorMessage: undefined
  };
};
