import { defineConfig } from "vite";
// @ts-ignore
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ["decorators-legacy", "classProperties"],
        },
      },
    }),
    tailwindcss(),
  ],
  base: "/",
  server: {
    port: 4200,
  },
  cacheDir: "../../node_modules/.vite",
  resolve: {
    alias: {
      ".prisma/client/index-browser": resolve(
        __dirname,
        "../../node_modules/.prisma/client/index-browser.js",
      ),
      "@growchief/frontend": resolve(__dirname, "src"),
      "@growchief/shared-both": resolve(__dirname, "../../shared/both"),
    },
  },
});
