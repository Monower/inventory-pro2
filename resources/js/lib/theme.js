const THEME_KEY = "theme";

export function getStoredTheme() {
    try {
        const storedTheme = localStorage.getItem(THEME_KEY);
        return storedTheme === "dark" || storedTheme === "light"
            ? storedTheme
            : null;
    } catch {
        return null;
    }
}

export function getSystemTheme() {
    if (typeof window === "undefined" || !window.matchMedia) {
        return "light";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function resolveTheme() {
    return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme) {
    if (typeof document === "undefined") return;

    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    try {
        localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch {
        // Ignore storage errors in private mode or restricted contexts.
    }
}

export function initializeTheme() {
    const theme = resolveTheme();
    applyTheme(theme);
    return theme;
}
