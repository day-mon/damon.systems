// vite.config.ts
import solid from "solid-start/vite";
import { defineConfig, loadEnv } from "vite";
var vite_config_default = defineConfig(({ command, mode }) => {
  loadEnv(mode, process.cwd());
  return {
    outDir: "dist",
    plugins: [solid()]
  };
});
export {
  vite_config_default as default
};
