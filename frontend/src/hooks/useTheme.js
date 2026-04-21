import { useState, useEffect } from "react";

const STORAGE_KEY = "hm-theme";
const STYLES_TAG_ID = "hm-dark-styles";

const DARK_CSS = `


html.dark body,
html.dark .min-h-screen {
  background-color: #0d1117 !important;
}

html.dark .bg-gradient-to-r:not(.keep-gradient),
html.dark .bg-gradient-to-b:not(.keep-gradient) {
  background: none !important;
}

html.dark .bg-gray-50  { background-color: #161b22 !important; }
html.dark .bg-gray-100 { background-color: #0d1117 !important; }

html.dark section.bg-white {
  background-color: #0d1117 !important;
}

html.dark .text-gray-900 { color: #e6edf3 !important; }
html.dark .text-gray-800 { color: #c9d1d9 !important; }
html.dark .text-gray-700 { color: #b1bac4 !important; }
html.dark .text-gray-600 { color: #8b949e !important; }
html.dark .text-gray-500 { color: #6e7681 !important; }


html.dark a { color: #58a6ff; }
html.dark a:hover { color: #79c0ff; }


html.dark .card,
html.dark [class*="rounded"].bg-white,
html.dark [class*="rounded"].bg-gray-50 {
  background-color: #161b22 !important;
  border: 1px solid #30363d !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  transition: all 0.2s ease;
}

/* HEALTHCARE HOVER (single correct version) */
html.dark .card:hover,
html.dark [class*="rounded"]:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 
    0 6px 20px rgba(56, 189, 248, 0.08),
    0 0 0 1px rgba(56, 189, 248, 0.15);
}

/* Elevated inner cards */
html.dark .bg-white.px-5.py-4.rounded-xl {
  background-color: #1c2230 !important;
}

html.dark input,
html.dark textarea,
html.dark select {
  background-color: #0d1117 !important;
  border: 1px solid #30363d !important;
  color: #e6edf3 !important;
}

html.dark input::placeholder,
html.dark textarea::placeholder {
  color: #6e7681 !important;
}

html.dark .border-gray-200 { border-color: #30363d !important; }
html.dark .border-gray-100 { border-color: #21262d !important; }


html.dark .bg-green-50 {
  background-color: rgba(63,185,80,0.12) !important;
  border-color: #238636 !important;
}
html.dark .text-green-700 { color: #3fb950 !important; }

html.dark .bg-yellow-50 {
  background-color: rgba(210,153,34,0.12) !important;
  border-color: #d29922 !important;
}
html.dark .text-yellow-700 { color: #d29922 !important; }

html.dark .bg-red-50 {
  background-color: rgba(248,81,73,0.12) !important;
  border-color: #f85149 !important;
}
html.dark .text-red-700 { color: #f85149 !important; }

html.dark .bg-blue-50 {
  background-color: rgba(56,139,253,0.12) !important;
  border-color: #1f6feb !important;
}
html.dark .text-blue-700 { color: #58a6ff !important; }

html.dark .hover\\:bg-gray-50:hover  { background-color: #161b22 !important; }
html.dark .hover\\:bg-gray-100:hover { background-color: #21262d !important; }

/* ✅ BUTTON HOVER (PROPER + SAFE) */
html.dark button:hover,
html.dark .btn-primary:hover {
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25);
}

html.dark ::-webkit-scrollbar {
  background: #0d1117;
}
html.dark ::-webkit-scrollbar-thumb {
  background: #30363d;
}



html.dark *:focus-visible {
  outline-color: #58a6ff !important;
}

`;

if (
  typeof document !== "undefined" &&
  !document.getElementById(STYLES_TAG_ID)
) {
  const style = document.createElement("style");
  style.id = STYLES_TAG_ID;
  style.textContent = DARK_CSS;
  document.head.appendChild(style);
}


export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefer = saved ? saved === "dark" : true;
    if (prefer) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return prefer;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(STORAGE_KEY, "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((v) => !v);

  return { isDark, toggleTheme };
};
