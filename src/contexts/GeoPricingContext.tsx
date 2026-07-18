import React, { createContext, useContext, useState, useEffect } from "react";

export interface CurrencyDetails {
  code: string;
  symbol: string;
  rate: number; // 1 unit of this currency = X XOF
  locale: string;
  symbolPosition: "prefix" | "suffix";
  decimals: number;
}

export const CURRENCY_MAP: Record<string, CurrencyDetails> = {
  // West African CFA (XOF)
  BJ: {
    code: "XOF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-BJ",
    symbolPosition: "suffix",
    decimals: 0,
  },
  CI: {
    code: "XOF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-CI",
    symbolPosition: "suffix",
    decimals: 0,
  },
  SN: {
    code: "XOF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-SN",
    symbolPosition: "suffix",
    decimals: 0,
  },
  TG: {
    code: "XOF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-TG",
    symbolPosition: "suffix",
    decimals: 0,
  },
  NE: {
    code: "XOF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-NE",
    symbolPosition: "suffix",
    decimals: 0,
  },
  ML: {
    code: "XOF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-ML",
    symbolPosition: "suffix",
    decimals: 0,
  },
  BF: {
    code: "XOF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-BF",
    symbolPosition: "suffix",
    decimals: 0,
  },
  GW: {
    code: "XOF",
    symbol: "FCFA",
    rate: 1,
    locale: "pt-GW",
    symbolPosition: "suffix",
    decimals: 0,
  },

  // Central African CFA (XAF)
  CM: {
    code: "XAF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-CM",
    symbolPosition: "suffix",
    decimals: 0,
  },
  CG: {
    code: "XAF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-CG",
    symbolPosition: "suffix",
    decimals: 0,
  },
  GA: {
    code: "XAF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-GA",
    symbolPosition: "suffix",
    decimals: 0,
  },
  TD: {
    code: "XAF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-TD",
    symbolPosition: "suffix",
    decimals: 0,
  },
  CF: {
    code: "XAF",
    symbol: "FCFA",
    rate: 1,
    locale: "fr-CF",
    symbolPosition: "suffix",
    decimals: 0,
  },
  GQ: {
    code: "XAF",
    symbol: "FCFA",
    rate: 1,
    locale: "es-GQ",
    symbolPosition: "suffix",
    decimals: 0,
  },

  // Other African Currencies
  KE: {
    code: "KES",
    symbol: "KSh",
    rate: 4.6,
    locale: "en-KE",
    symbolPosition: "prefix",
    decimals: 0,
  },
  RW: {
    code: "RWF",
    symbol: "RF",
    rate: 0.46,
    locale: "rw-RW",
    symbolPosition: "prefix",
    decimals: 0,
  },
  UG: {
    code: "UGX",
    symbol: "USh",
    rate: 0.16,
    locale: "en-UG",
    symbolPosition: "prefix",
    decimals: 0,
  },
  ZM: {
    code: "ZMW",
    symbol: "ZK",
    rate: 23,
    locale: "en-ZM",
    symbolPosition: "prefix",
    decimals: 0,
  },
  CD: {
    code: "CDF",
    symbol: "FC",
    rate: 0.21,
    locale: "fr-CD",
    symbolPosition: "suffix",
    decimals: 0,
  },
  SL: {
    code: "SLE",
    symbol: "Le",
    rate: 26,
    locale: "en-SL",
    symbolPosition: "prefix",
    decimals: 0,
  },

  // Europe (EUR)
  FR: {
    code: "EUR",
    symbol: "€",
    rate: 655.957,
    locale: "fr-FR",
    symbolPosition: "suffix",
    decimals: 2,
  },
  DE: {
    code: "EUR",
    symbol: "€",
    rate: 655.957,
    locale: "de-DE",
    symbolPosition: "suffix",
    decimals: 2,
  },
  IT: {
    code: "EUR",
    symbol: "€",
    rate: 655.957,
    locale: "it-IT",
    symbolPosition: "suffix",
    decimals: 2,
  },
  ES: {
    code: "EUR",
    symbol: "€",
    rate: 655.957,
    locale: "es-ES",
    symbolPosition: "suffix",
    decimals: 2,
  },
  BE: {
    code: "EUR",
    symbol: "€",
    rate: 655.957,
    locale: "fr-BE",
    symbolPosition: "suffix",
    decimals: 2,
  },

  // UK (GBP)
  GB: {
    code: "GBP",
    symbol: "£",
    rate: 760,
    locale: "en-GB",
    symbolPosition: "prefix",
    decimals: 2,
  },

  // USA & Global Fallback
  US: {
    code: "USD",
    symbol: "$",
    rate: 600,
    locale: "en-US",
    symbolPosition: "prefix",
    decimals: 2,
  },
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // CFA Zone
  BJ: "XOF", CI: "XOF", SN: "XOF", TG: "XOF", NE: "XOF", ML: "XOF", BF: "XOF", GW: "XOF",
  CM: "XAF", CG: "XAF", GA: "XAF", TD: "XAF", CF: "XAF", GQ: "XAF",
  // Africa
  NG: "NGN", GH: "GHS", ZA: "ZAR", KE: "KES", RW: "RWF", UG: "UGX", ZM: "ZMW", CD: "CDF", SL: "SLE",
  MA: "MAD", DZ: "DZD", TN: "TND", EG: "EGP", LY: "LYD", SD: "SDG", GN: "GNF", MR: "MRU",
  // Europe
  GB: "GBP", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", TR: "TRY", RU: "RUB",
  // Eurozone
  AT: "EUR", BE: "EUR", CY: "EUR", EE: "EUR", FI: "EUR", FR: "EUR", DE: "EUR", GR: "EUR",
  HR: "EUR", IE: "EUR", IT: "EUR", LV: "EUR", LT: "EUR", LU: "EUR", MT: "EUR", NL: "EUR",
  PT: "EUR", SK: "EUR", SI: "EUR", ES: "EUR", MC: "EUR", SM: "EUR", VA: "EUR", ME: "EUR", XK: "EUR",
  // Americas
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS", CO: "COP", PE: "PEN", CL: "CLP", VE: "VES",
  // Asia & Oceania
  JP: "JPY", CN: "CNY", IN: "INR", AU: "AUD", NZ: "NZD", SG: "SGD", HK: "HKD", KR: "KRW",
  AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", OM: "OMR", BH: "BHD", IL: "ILS",
};

const STATIC_RATES: Record<string, number> = {
  XOF: 1.0,
  XAF: 1.0,
  USD: 1 / 600,
  EUR: 1 / 655.957,
  GBP: 1 / 760,
  KES: 1 / 4.6,
  RWF: 1 / 0.46,
  UGX: 1 / 0.16,
  ZMW: 1 / 23,
  CDF: 1 / 0.21,
  SLE: 1 / 26,
};

const getCurrencyDetails = (
  currencyCode: string,
  countryCode: string,
  rateValue?: number
): CurrencyDetails => {
  const symbolMap: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "$", AUD: "$", CHF: "CHF",
    XOF: "FCFA", XAF: "FCFA", CDF: "FC", KES: "KSh", RWF: "RF", UGX: "USh",
    ZMW: "ZK", SLE: "Le", NGN: "₦", GHS: "GH₵", ZAR: "R", MAD: "DH",
  };

  const prefixCurrencies = ["USD", "GBP", "CAD", "AUD", "JPY", "KES", "RWF", "UGX", "ZMW", "SLE", "NGN", "GHS", "ZAR"];
  const decimalCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF"];

  const symbol = symbolMap[currencyCode] || currencyCode;
  const symbolPosition = prefixCurrencies.includes(currencyCode) ? "prefix" : "suffix";
  const decimals = decimalCurrencies.includes(currencyCode) ? 2 : 0;

  let locale = "fr-FR";
  if (currencyCode === "USD") locale = "en-US";
  else if (currencyCode === "GBP") locale = "en-GB";
  else if (currencyCode === "CAD") locale = "en-CA";
  else if (currencyCode === "AUD") locale = "en-AU";
  else if (currencyCode === "JPY") locale = "ja-JP";
  else if (currencyCode === "XOF") locale = `fr-${countryCode}`;
  else if (currencyCode === "XAF") locale = `fr-${countryCode}`;
  else if (currencyCode === "NGN") locale = "en-NG";
  else if (currencyCode === "GHS") locale = "en-GH";
  else if (currencyCode === "ZAR") locale = "en-ZA";
  else if (currencyCode === "KES") locale = "en-KE";

  let rate = 1;
  if (rateValue) {
    rate = 1 / rateValue;
  } else {
    const staticRate = STATIC_RATES[currencyCode];
    if (staticRate) {
      rate = 1 / staticRate;
    } else {
      rate = 600; // default conversion rate
    }
  }

  return {
    code: currencyCode,
    symbol,
    rate,
    locale,
    symbolPosition,
    decimals,
  };
};

export const DEFAULT_CURRENCY: CurrencyDetails = {
  code: "XOF",
  symbol: "FCFA",
  rate: 1,
  locale: "fr-BJ",
  symbolPosition: "suffix",
  decimals: 0,
};

interface GeoPricingContextType {
  countryCode: string;
  currency: CurrencyDetails;
  formatPrice: (priceInXof: number) => string;
  convertPrice: (priceInXof: number) => number;
  changeCountry: (code: string) => void;
  loading: boolean;
}

const GeoPricingContext = createContext<GeoPricingContextType | undefined>(undefined);

export const GeoPricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryCode, setCountryCode] = useState<string>("BJ");
  const [currency, setCurrency] = useState<CurrencyDetails>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState<boolean>(true);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(STATIC_RATES);

  const isLocalhost = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1" ||
     window.location.hostname.startsWith("192.168."));

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/XOF");
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates) {
            setExchangeRates(prev => ({
              ...prev,
              ...data.rates
            }));
          }
        }
      } catch (e) {
        console.warn("Failed to fetch exchange rates, using fallback", e);
      }
    };
    fetchRates();
  }, []);

  const resolveCurrency = (code: string, detectedCurrency?: string): CurrencyDetails => {
    const cleanCode = code.toUpperCase();
    const currencyCode = detectedCurrency || COUNTRY_TO_CURRENCY[cleanCode] || "USD";
    const currentRateValue = exchangeRates[currencyCode] || STATIC_RATES[currencyCode];
    return getCurrencyDetails(currencyCode, cleanCode, currentRateValue);
  };

  const applyCountryAndCurrency = (code: string, detectedCurrency?: string) => {
    const cleanCode = code.toUpperCase();
    setCountryCode(cleanCode);
    if (detectedCurrency) {
      sessionStorage.setItem("tech_detected_currency", detectedCurrency);
    } else {
      sessionStorage.removeItem("tech_detected_currency");
    }
    setCurrency(resolveCurrency(cleanCode, detectedCurrency));
  };

  const changeCountry = (code: string) => {
    const cleanCode = code.toUpperCase();
    const curCode = COUNTRY_TO_CURRENCY[cleanCode] || "USD";
    applyCountryAndCurrency(cleanCode, curCode);
    localStorage.setItem("tech_user_country_override", cleanCode);
    localStorage.setItem("tech_user_currency_override", curCode);
  };

  // Sync currency details when rates or countryCode change
  useEffect(() => {
    const resolved = resolveCurrency(countryCode, sessionStorage.getItem("tech_detected_currency") || undefined);
    setCurrency(resolved);
  }, [countryCode, exchangeRates]);

  useEffect(() => {
    const detect = async () => {
      // Clear legacy localStorage cache from previous versions
      localStorage.removeItem("tech_detected_country");

      // 1. Check for manual override first (highest priority)
      const override = localStorage.getItem("tech_user_country_override");
      const overrideCurrency = localStorage.getItem("tech_user_currency_override");
      if (override) {
        applyCountryAndCurrency(override, overrideCurrency || undefined);
        setLoading(false);
        return;
      }

      // 2. Check sessionStorage for session-based cache (bypassed on localhost for live VPN testing)
      if (!isLocalhost) {
        const cached = sessionStorage.getItem("tech_detected_country");
        const cachedCurrency = sessionStorage.getItem("tech_detected_currency");
        if (cached) {
          applyCountryAndCurrency(cached, cachedCurrency || undefined);
          setLoading(false);
          return;
        }
      }

      // 3. Fetch from ipapi.co
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const country = data.country_code?.trim().toUpperCase();
          const detectedCurrency = data.currency?.trim().toUpperCase();
          if (country && country.length === 2) {
            applyCountryAndCurrency(country, detectedCurrency);
            sessionStorage.setItem("tech_detected_country", country);
            if (detectedCurrency) {
              sessionStorage.setItem("tech_detected_currency", detectedCurrency);
            }
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("ipapi.co failed, trying ip-api.com", e);
      }

      // 4. Fallback to freeipapi.com
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch("https://freeipapi.com/api/json", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const country = data.countryCode?.trim().toUpperCase();
          const detectedCurrency = data.currency?.code?.trim().toUpperCase() || data.currency?.trim().toUpperCase();
          if (country && country.length === 2) {
            applyCountryAndCurrency(country, detectedCurrency);
            sessionStorage.setItem("tech_detected_country", country);
            if (detectedCurrency) {
              sessionStorage.setItem("tech_detected_currency", detectedCurrency);
            }
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("freeipapi.com failed", e);
      }

      // 5. Fallback to browser locale (only if explicitly in CURRENCY_MAP and not FR/US/GB to avoid false European defaults for West African users)
      try {
        const locale = navigator.language || (navigator as any).userLanguage;
        if (locale) {
          const parts = locale.split("-");
          const code = parts[parts.length - 1].toUpperCase();
          if (
            code &&
            code.length === 2 &&
            CURRENCY_MAP[code] &&
            code !== "FR" &&
            code !== "US" &&
            code !== "GB"
          ) {
            applyCountryAndCurrency(code);
            sessionStorage.setItem("tech_detected_country", code);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("locale detection failed", e);
      }

      // 6. Ultimate default: Benin
      applyCountryAndCurrency("BJ");
      sessionStorage.setItem("tech_detected_country", "BJ");
      setLoading(false);
    };

    detect();
  }, []);

  const convertPrice = (priceInXof: number): number => {
    const converted = priceInXof / currency.rate;
    return Number(converted.toFixed(currency.decimals));
  };

  const formatPrice = (priceInXof: number): string => {
    const converted = convertPrice(priceInXof);
    const formattedNumber = new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(converted);

    if (currency.symbolPosition === "prefix") {
      const space = currency.symbol.length > 1 ? " " : "";
      return `${currency.symbol}${space}${formattedNumber}`;
    } else {
      return `${formattedNumber} ${currency.symbol}`;
    }
  };

  return (
    <GeoPricingContext.Provider
      value={{ countryCode, currency, formatPrice, convertPrice, changeCountry, loading }}
    >
      {children}
    </GeoPricingContext.Provider>
  );
};

export const useGeoPricing = () => {
  const context = useContext(GeoPricingContext);
  if (context === undefined) {
    throw new Error("useGeoPricing must be used within a GeoPricingProvider");
  }
  return context;
};
