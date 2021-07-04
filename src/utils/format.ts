export const LocaleCurrencyFormatter = Intl.NumberFormat(navigator.language, { minimumFractionDigits: 2 })
export const LocaleAmountFormatter = Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0 })
