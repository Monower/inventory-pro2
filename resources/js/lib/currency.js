export const formatCurrency = (value, currencySymbol = "TK", locale = "en-BD") => {
    const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    return `${currencySymbol} ${formatter.format(Number(value || 0))}`;
};
