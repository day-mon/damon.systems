import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		tailwindcss(),
		// markdown: enforce extension so implicit .md/.mdx include logic stays explicit
		{
			enforce: "pre",
			...mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }),
		},
		tanstackStart(),
		viteReact(),
	],
});

export default config;
