import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // One fsModuleCache per package: the default is one directory for the whole workspace, which
    // parallel turbo test tasks race to clear after every bun.lock change (ENOTEMPTY).
    fsModuleCachePath: "node_modules/.vitest-cache",
    include: ["tests/**/*.test.ts"],
    passWithNoTests: true,
    // Integration suites create and drop a database in their hooks.
    hookTimeout: 30_000,
  },
});
