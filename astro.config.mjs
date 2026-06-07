import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://serruriertoulouse.fr",
  vite: {
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [tailwindcss()],
  },
});
