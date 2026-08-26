import {
	SiDiscord,
	SiGithub,
	SiGmail,
	SiInstagram,
	SiX,
	SiYoutubemusic,
} from "@icons-pack/react-simple-icons";
import * as stylex from "@stylexjs/stylex";
import { createFileRoute } from "@tanstack/react-router";
// no current icon lib ships linkedin (trademark); keep that one svg asset
import linkedinSvg from "#/assets/icons/linkedin.svg?raw";

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
	{ label: "twitter", href: "https://twitter.com/lisp", Icon: SiX },
	{ label: "github", href: "https://github.com/day-mon", Icon: SiGithub },
	{
		label: "linkedin",
		href: "https://www.linkedin.com/in/day-mon/",
		Icon: LinkedInIcon,
	},
	{
		label: "discord",
		href: "https://discord.com/users/105141507996061696",
		Icon: SiDiscord,
	},
	{
		label: "instagram",
		href: "https://instagram.com/adopted",
		Icon: SiInstagram,
	},
	{
		label: "music",
		href: "https://music.youtube.com/channel/UCVzQffzdvb43n-Vvw7grtqQ",
		Icon: SiYoutubemusic,
	},
];

// size arg matches the simple-icons call sites; .icon-slot css does sizing
// SAFETY: static trusted svg asset, not user input
function LinkedInIcon(_props: { size?: number }) {
	return (
		<span
			aria-hidden
			// biome-ignore lint/security/noDangerouslySetInnerHtml: static trusted svg asset
			dangerouslySetInnerHTML={{ __html: linkedinSvg }}
		/>
	);
}

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
				{LINKS.map(({ label, href, Icon }) => (
					<div key={label} {...stylex.props(styles.row)}>
						<span className="icon-slot">
							<Icon size={16} aria-hidden />
						</span>
						<a href={href} target="_blank" rel="noopener noreferrer">
							{label}
						</a>
					</div>
				))}

				<div {...stylex.props(styles.row)}>
					<span className="icon-slot">
						<SiGmail size={16} aria-hidden />
					</span>
					<a href="mailto:damon@montague.im">damon@montague.im</a>
				</div>
			</div>
		</main>
	);
}
