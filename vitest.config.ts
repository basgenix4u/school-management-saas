import { defineConfig } from "vitest/config";

/**
 * Test configuration.
 *
 * `css: false` and the disabled PostCSS pipeline keep the suite independent of
 * the Tailwind build: these are logic and policy tests, so loading the styling
 * toolchain would only add failure modes.
 */
export default defineConfig({
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: "default",
  },
});
