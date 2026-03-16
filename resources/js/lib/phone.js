export const sanitizePhoneInput = (value, maxDigits) =>
    String(value ?? "")
        .replace(/\D/g, "")
        .slice(0, Math.max(Number(maxDigits) || 0, 0));
