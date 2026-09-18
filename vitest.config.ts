import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Test configuration.
 *
 * The PostCSS pipeline is disabled to keep the suite independent of the
 * Tailwind build: these are logic and policy tests, so loading the styling
 * toolchain would only add failure modes. The `@` alias mirrors tsconfig so
 * tested modules resolve exactly as they do in the app.
 */
export default defineConfig({
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: "default",
  },
});
