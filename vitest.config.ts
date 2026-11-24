import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    // Content tests read the whole content/ tree and git history.
    testTimeout: 20_000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside a React Server environment.
      "server-only": fileURLToPath(new URL("./__tests__/stubs/empty.ts", import.meta.url)),
    },
  },
});
