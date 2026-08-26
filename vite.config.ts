import stylex from "@stylexjs/unplugin";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [stylex.vite({ useCSSLayers: true }), tanstackStart(), viteReact()],
});

export default config;
