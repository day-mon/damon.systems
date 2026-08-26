import PghTicketContent, {
	frontmatter as pghTicketFrontmatter,
} from "./pgh-ticket.mdx";

export type LabPost = {
	slug: string;
	title: string;
	description: string;
	date: Date;
	tags: string[];
	demoComponent?: string;
	Content: typeof PghTicketContent;
};

const ALL_POSTS: (LabPost & { draft?: boolean })[] = [
	{
		slug: "pgh-ticket",
		title: pghTicketFrontmatter.title,
		description: pghTicketFrontmatter.description,
		date: new Date(pghTicketFrontmatter.date),
		tags: pghTicketFrontmatter.tags ?? [],
		demoComponent: pghTicketFrontmatter.demoComponent,
		draft: pghTicketFrontmatter.draft,
		Content: PghTicketContent,
	},
];

export const LAB_POSTS: LabPost[] = ALL_POSTS.filter((post) => !post.draft);

export function getLabPost(slug: string): LabPost | undefined {
	return LAB_POSTS.find((p) => p.slug === slug);
}
