import { IconButton } from "@astryxdesign/core/IconButton";
import * as stylex from "@stylexjs/stylex";
import { ExternalLink, RefreshCw, Star } from "lucide-react";
import { m } from "motion/react";

import { EXCLUDED_REPOS, getLanguageColor } from "#/constants";
import { useGithubRepos } from "#/queries/github/queries";
import type { GitHubRepo } from "#/queries/github/types";
import { ProjectsError } from "./error";
import { ProjectsSkeleton } from "./skeleton";

const spin = stylex.keyframes({
	from: { transform: "rotate(0deg)" },
	to: { transform: "rotate(360deg)" },
});

const styles = stylex.create({
	wrap: {
		display: "flex",
		flexDirection: "column",
		gap: 24,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: 12,
	},
	title: {
		fontSize: "1.5rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		margin: 0,
	},
	list: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
		fontSize: "0.875rem",
		listStyle: "none",
		margin: 0,
		padding: 0,
	},
	row: {
		display: "flex",
		alignItems: "baseline",
		gap: 8,
	},
	repoName: {
		fontWeight: 500,
		flexShrink: 0,
	},
	meta: {
		color: "var(--muted-foreground)",
		fontSize: "0.75rem",
		display: "flex",
		alignItems: "center",
		gap: 2,
		flexShrink: 0,
	},
	metaLang: {
		color: "var(--muted-foreground)",
		fontSize: "0.75rem",
		display: "flex",
		alignItems: "center",
		gap: 4,
		flexShrink: 0,
	},
	metaEnd: {
		opacity: 0.6,
		fontSize: "0.75rem",
		marginLeft: "auto",
	},
	langDot: (color: string) => ({
		display: "inline-block",
		width: 8,
		height: 8,
		backgroundColor: color,
	}),
	description: {
		color: "var(--muted-foreground)",
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	spinning: {
		display: "inline-flex",
		animationName: spin,
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
});

export function ProjectsList() {
	const { data, isPending, isFetching, error, refetch } = useGithubRepos({
		select: (repos: GitHubRepo[]) =>
			repos
				.filter(
					(repo) =>
						!repo.private && !repo.fork && !EXCLUDED_REPOS.includes(repo.name),
				)
				.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)),
	});

	if (isPending) {
		return <ProjectsSkeleton />;
	}

	if (error) {
		return <ProjectsError message={error.message} />;
	}

	const repos = data ?? [];

	return (
		<div {...stylex.props(styles.wrap)}>
			<div {...stylex.props(styles.header)}>
				<h1 {...stylex.props(styles.title)}>projects</h1>
				<IconButton
					label="Refresh projects"
					variant="ghost"
					size="sm"
					icon={
						<span {...stylex.props(isFetching && styles.spinning)}>
							<RefreshCw size={14} />
						</span>
					}
					clickAction={async () => {
						await refetch();
					}}
				/>
			</div>

			<ul {...stylex.props(styles.list)}>
				{repos.map((repo, i) => (
					<m.li
						key={repo.name}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: i * 0.04,
							duration: 0.3,
							ease: [0.22, 1, 0.36, 1],
						}}
						{...stylex.props(styles.row)}
					>
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							{...stylex.props(styles.repoName)}
						>
							{repo.name.toLowerCase()}
						</a>
						{repo.stargazers_count > 0 && (
							<span {...stylex.props(styles.meta)}>
								<Star size={12} />
								{repo.stargazers_count}
							</span>
						)}
						{repo.language && (
							<span {...stylex.props(styles.metaLang)}>
								<span
									{...stylex.props(
										styles.langDot(getLanguageColor(repo.language)),
									)}
								/>
								{repo.language}
							</span>
						)}
						{repo.homepage && (
							<a
								href={repo.homepage}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`${repo.name} homepage`}
							>
								<ExternalLink size={12} />
							</a>
						)}
						<span {...stylex.props(styles.description)}>
							{repo.description?.toLowerCase() || "no description"}
						</span>
					</m.li>
				))}
			</ul>
		</div>
	);
}
