import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Change "calc-plus" to your actual GitHub repo name
const REPO_NAME = "calc-plus";

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: set base to /<repo-name>/
  // For custom domain or root deployment: set base to "/"
  base: process.env.NODE_ENV === "production" ? `/${REPO_NAME}/` : "/",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
