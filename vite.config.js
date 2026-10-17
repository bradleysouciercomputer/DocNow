import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // This repository is published under https://bradleysouciercomputer.github.io/DocNow/
  base: "/DocNow/",
  plugins: [react()],
});