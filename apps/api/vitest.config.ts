import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    hookTimeout: 30_000,
    // One fsModuleCache per package: the default is one directory for the whole workspace, which
    // parallel turbo test tasks race to clear after every bun.lock change (ENOTEMPTY).
    fsModuleCachePath: "node_modules/.vitest-cache",
  },
});
