import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert/server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert/server.crt")),
    },
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
