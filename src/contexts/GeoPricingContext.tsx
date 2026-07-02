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

  const resolveCurrency = (code: string): CurrencyDetails => {
    const match = CURRENCY_MAP[code.toUpperCase()];
    if (match) return match;

    // Check if it's a Euro country not explicitly listed
    const eurCountries = ["AT", "FI", "GR", "IE", "PT", "NL", "LU"];
    if (eurCountries.includes(code.toUpperCase())) {
      return {
        code: "EUR",
        symbol: "€",
        rate: 655.957,
        locale: "fr-FR",
        symbolPosition: "suffix",
        decimals: 2,
      };
    }

    // Default to USD for other international countries
    return CURRENCY_MAP["US"];
  };

  const applyCountryAndCurrency = (code: string) => {
    const cleanCode = code.toUpperCase();
    setCountryCode(cleanCode);
    setCurrency(resolveCurrency(cleanCode));
  };

  const changeCountry = (code: string) => {
    const cleanCode = code.toUpperCase();
    applyCountryAndCurrency(cleanCode);
    localStorage.setItem("tech_user_country_override", cleanCode);
  };

  useEffect(() => {
    const detect = async () => {
      // Clear legacy localStorage cache from previous versions
      localStorage.removeItem("tech_detected_country");

      // 1. Check for manual override first (highest priority)
      const override = localStorage.getItem("tech_user_country_override");
      if (override) {
        applyCountryAndCurrency(override);
        setLoading(false);
        return;
      }

      // 2. Check sessionStorage for session-based cache (to avoid duplicate API hits)
      const cached = sessionStorage.getItem("tech_detected_country");
      if (cached) {
        applyCountryAndCurrency(cached);
        setLoading(false);
        return;
      }

      // 3. Fetch from ipapi.co
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch("https://ipapi.co/country/", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const code = (await res.text()).trim().toUpperCase();
          if (code && code.length === 2) {
            applyCountryAndCurrency(code);
            sessionStorage.setItem("tech_detected_country", code);
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
          const code = data.countryCode?.trim().toUpperCase();
          if (code && code.length === 2) {
            applyCountryAndCurrency(code);
            sessionStorage.setItem("tech_detected_country", code);
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
    // Format to specified decimals
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
