import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Frontend dev server. In production, VITE_API_BASE_URL points at the
// Express API (see src/services/api/client.js). For local dev without
// setting that env var, /api is proxied straight to the Express server
// (see /server) so `npm run dev` works out of the box alongside it.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
