import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";



const originalError = console.error;

console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Cross-Origin-Opener-Policy")
  ) {
    return; 
  }
  originalError(...args);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
