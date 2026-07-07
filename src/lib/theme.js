export const themes = {
  "Light enterprise": {
    key: "light-enterprise",
    color: "#2563EB"
  },
  "High contrast": {
    key: "high-contrast",
    color: "#0F172A"
  },
  "Presentation focus": {
    key: "presentation-focus",
    color: "#0891B2"
  }
};

export function getStoredTheme() {
  if (typeof window === "undefined") return "Light enterprise";
  const storedTheme = window.localStorage.getItem("hireflow-theme");
  return Object.keys(themes).includes(storedTheme) ? storedTheme : "Light enterprise";
}

export function applyThemeToDocument(themeName) {
  if (typeof document === "undefined") return;
  const selected = themes[themeName] ?? themes["Light enterprise"];
  document.documentElement.dataset.theme = selected.key;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", selected.color);
}

export function applyStoredTheme() {
  applyThemeToDocument(getStoredTheme());
}
