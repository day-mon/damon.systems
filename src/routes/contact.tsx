import {
	SiDiscord,
	SiGithub,
	SiGmail,
	SiInstagram,
	SiX,
	SiYoutubemusic,
} from "@icons-pack/react-simple-icons";
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

function Contact() {
	return (
		<main className="mx-auto max-w-3xl px-8 pt-12 pb-20">
			<h1 className="mb-8 text-2xl font-light tracking-tight">contact</h1>

			<div className="flex flex-col gap-3">
				{LINKS.map(({ label, href, Icon }) => (
					<div key={label} className="flex items-center gap-2">
						<span className="icon-slot">
							<Icon size={16} aria-hidden />
						</span>
						<a href={href} target="_blank" rel="noopener noreferrer">
							{label}
						</a>
					</div>
				))}

				<div className="flex items-center gap-2">
					<span className="icon-slot">
						<SiGmail size={16} aria-hidden />
					</span>
					<a href="mailto:damon@montague.im">damon@montague.im</a>
				</div>
			</div>
		</main>
	);
}
