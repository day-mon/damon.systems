import * as stylex from "@stylexjs/stylex";
import { createFileRoute } from "@tanstack/react-router";

import discordSvg from "#/assets/icons/discord.svg?raw";
import githubSvg from "#/assets/icons/github.svg?raw";
import instagramSvg from "#/assets/icons/instagram.svg?raw";
import linkedinSvg from "#/assets/icons/linkedin.svg?raw";
import mailSvg from "#/assets/icons/mail.svg?raw";
import musicSvg from "#/assets/icons/music.svg?raw";
import xSvg from "#/assets/icons/x.svg?raw";

export const Route = createFileRoute("/contact")({
	head: () => ({
		meta: [
			{ title: "damon | contact" },
			{ name: "description", content: "contact me" },
			{ property: "og:image", content: "/contact.png" },
		],
	}),
	component: Contact,
});

const LINKS = [
	{ label: "twitter", href: "https://twitter.com/lisp", svg: xSvg },
	{ label: "github", href: "https://github.com/day-mon", svg: githubSvg },
	{
		label: "linkedin",
		href: "https://www.linkedin.com/in/day-mon/",
		svg: linkedinSvg,
	},
	{
		label: "discord",
		href: "https://discord.com/users/105141507996061696",
		svg: discordSvg,
	},
	{
		label: "instagram",
		href: "https://instagram.com/adopted",
		svg: instagramSvg,
	},
	{
		label: "music",
		href: "https://music.youtube.com/channel/UCVzQffzdvb43n-Vvw7grtqQ",
		svg: musicSvg,
	},
];

const fadeIn = stylex.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const styles = stylex.create({
	main: {
		maxWidth: "48rem",
		marginInline: "auto",
		paddingTop: 48,
		paddingBottom: 80,
		paddingInline: 32,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	title: {
		fontSize: "1.5rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		marginBottom: 32,
	},
	list: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: 8,
	},
});

function Contact() {
	return (
		<main {...stylex.props(styles.main)}>
			<h1 {...stylex.props(styles.title)}>contact</h1>

			<div {...stylex.props(styles.list)}>
				{LINKS.map(({ label, href, svg }) => (
					<div key={label} {...stylex.props(styles.row)}>
						{/* SAFETY: svgs are static repo assets, not user input */}
						<span
							className="icon-slot"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: static trusted svg assets
							dangerouslySetInnerHTML={{ __html: svg }}
						/>
						<a href={href} target="_blank" rel="noopener noreferrer">
							{label}
						</a>
					</div>
				))}

				<div {...stylex.props(styles.row)}>
					{/* SAFETY: static trusted svg asset */}
					<span
						className="icon-slot"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: static trusted svg asset
						dangerouslySetInnerHTML={{ __html: mailSvg }}
					/>
					<a href="mailto:damon@montague.im">damon@montague.im</a>
				</div>
			</div>
		</main>
	);
}
