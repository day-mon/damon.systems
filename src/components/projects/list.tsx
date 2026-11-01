import { ExternalLink, RefreshCw, Star } from "lucide-react";
import { m, useReducedMotion } from "motion/react";

import { EXCLUDED_REPOS, getLanguageColor } from "#/constants";
import { useGithubRepos } from "#/queries/github/queries";
import type { GitHubRepo } from "#/queries/github/types";
import { Button } from "~/components/ui/button";
import { ProjectsError } from "./error";
import { ProjectsSkeleton } from "./skeleton";

export function ProjectsList() {
	const reduceMotion = useReducedMotion();

	const { data, isPending, isFetching, error, refetch } = useGithubRepos({
		select: (repos: GitHubRepo[]) =>
			repos
				.filter(
					(repo) =>
						!repo.private && !repo.fork && !EXCLUDED_REPOS.includes(repo.name),
				)
				.toSorted(
					(a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0),
				),
	});

	if (isPending) {
		return <ProjectsSkeleton />;
	}

	if (error) {
		return <ProjectsError message={error.message} />;
	}

	const repos = data ?? [];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-3">
				<h1 className="m-0 text-2xl font-light tracking-tight">projects</h1>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Refresh projects"
					disabled={isFetching}
					onClick={() => refetch()}
				>
					<RefreshCw
						size={14}
						className={isFetching ? "animate-spin" : undefined}
					/>
				</Button>
			</div>

			{/* blur+dim while fetching: bridges the row-swap snap after refresh */}
			<ul
				className={`m-0 flex list-none flex-col gap-3 p-0 text-sm transition-[filter,opacity] duration-200 ease-out${
					isFetching ? " opacity-70 blur-[2px]" : ""
				}`}
			>
				{repos.map((repo, i) => (
					<m.li
						key={repo.name}
						initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: i * 0.03,
							duration: 0.3,
							ease: [0.23, 1, 0.32, 1],
						}}
						className="flex items-baseline gap-2"
					>
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="shrink-0 font-medium"
						>
							{repo.name.toLowerCase()}
						</a>
						{repo.stargazers_count > 0 && (
							<span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
								<Star size={12} />
								{repo.stargazers_count}
							</span>
						)}
						{repo.language && (
							<span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
								<span
									className="inline-block size-2"
									style={{ backgroundColor: getLanguageColor(repo.language) }}
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
								className="inline-flex text-muted-foreground"
							>
								<ExternalLink size={12} />
							</a>
						)}
						<span className="truncate text-muted-foreground">
							{repo.description?.toLowerCase() || "no description"}
						</span>
					</m.li>
				))}
			</ul>
		</div>
	);
}
