import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// 判斷是否為開發模式
const isDev = process.env.NODE_ENV !== "production";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: isDev
    ? {
        https: {
          key: fs.readFileSync(path.resolve(__dirname, "cert/server.key")),
          cert: fs.readFileSync(path.resolve(__dirname, "cert/server.crt")),
        },
        host: "0.0.0.0",
      }
    : undefined,
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
