import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";

import { reactOptions } from "./vite.storybook.ts";

const root = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig(({ mode }) => {
  // One .env.local at the repo root feeds every app and the db scripts. Deploys set real env.
  Object.assign(process.env, loadEnv(mode, root, ""));
  return {
    envDir: root,
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    // Nitro picks the deploy preset from the environment (Vercel, Node, ...).
    plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact(reactOptions)],
  };
});
