import solid from "solid-start/vite";
import {defineConfig, loadEnv} from "vite";

export default defineConfig(({ command, mode }) => {
  loadEnv(mode, process.cwd());
    return {
      outDir: "dist",
      plugins: [solid()],
    }
})
