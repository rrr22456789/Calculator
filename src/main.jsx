import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Calculator from "./Calculator.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Calculator />
  </StrictMode>
);

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.log("SW failed:", err));
  });
}
