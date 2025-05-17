// /**
//  * Formats a price amount with proper currency symbol and decimal places
//  * @param amount The price amount in cents/smallest currency unit
//  * @param currencyCode The ISO currency code (e.g. USD, EUR)
//  * @returns Formatted price string
//  */
// export const formatPrice = (
//     amount: number | null | undefined,
//     currencyCode: string = "USD",
//     locale: string = "en-US"
//   ): string => {
//     if (amount === null || amount === undefined) {
//       return "Price unavailable";
//     }
  
//     // Convert from cents to standard currency unit
//     const convertedAmount = amount / 100;
  
//     try {
//       // Use the browser's Intl API to format the currency
//       return new Intl.NumberFormat(locale, {
//         style: "currency",
//         currency: currencyCode,
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }).format(convertedAmount);
//     } catch (error) {
//       // Fallback formatting if the currency code is invalid
//       return `${currencyCode} ${convertedAmount.toFixed(2)}`;
//     }
//   };

// src/lib/util/format-price.ts
/**
 * Formats a price amount with proper currency symbol and decimal places
 * @param amount The price amount in cents/smallest currency unit
 * @param currencyCode The ISO currency code (e.g. USD, EUR)
 * @returns Formatted price string
 */
export const formatPrice = (
    amount: number | null | undefined,
    currencyCode: string = "USD",
    locale: string = "en-US"
  ): string => {
    if (amount === null || amount === undefined) {
      return "Price unavailable";
    }
  
    // Convert from cents to standard currency unit
    const convertedAmount = amount / 100;
  
    try {
      // Use the browser's Intl API to format the currency
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
    } catch (error) {
      // Fallback formatting if the currency code is invalid
      return `${currencyCode} ${convertedAmount.toFixed(2)}`;
    }
  };