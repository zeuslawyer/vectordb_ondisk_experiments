import { defineConfig } from "vite";

export default defineConfig({
  root: "ui",
  server: {
    open: true,
  },
  build: {
    outDir: "../dist",
  },
});
