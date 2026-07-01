import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }

          if (id.includes("/pages/Dashboard/")) {
            return "dashboard";
          }

          if (id.includes("/pages/Auth/")) {
            return "auth";
          }
        },
      },
    },
  },
});
