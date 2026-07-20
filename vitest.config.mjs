import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["assistant/tests/**/*.test.mjs"],
    environment: "node",
    globals: true
  }
});
