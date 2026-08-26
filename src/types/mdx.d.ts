/// <reference types="vite/client" />

declare module "*.mdx" {
	import type { ComponentType } from "react";

	export type LabFrontmatter = {
		title: string;
		description: string;
		date: string;
		draft?: boolean;
		tags?: string[];
		demoComponent?: string;
	};

	export const frontmatter: LabFrontmatter;
	const Component: ComponentType;
	export default Component;
}
