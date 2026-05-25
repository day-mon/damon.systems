import { ExternalLink, RefreshCw, Star } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { EXCLUDED_REPOS, getLanguageColor } from "~/constants";
import { useGithubRepos } from "~/queries/github/queries";
import type { GitHubRepo } from "~/queries/github/types";
import ProjectsError from "./error";
import ProjectsSkeleton from "./skeleton";

export default function ProjectsList() {
	const { data, isLoading, isFetching, error, refetch } = useGithubRepos({
		select: (data: GitHubRepo[]) =>
			data
				.filter((repo) => !repo.private)
				.filter((repo) => !repo.fork)
				.filter((repo) => !EXCLUDED_REPOS.includes(repo.name))
				.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)),
	});

	if (isLoading) {
		return <ProjectsSkeleton />;
	}

	if (error) {
		return <ProjectsError message={error.message} />;
	}

	const repos = data || [];

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<h1 className="text-2xl font-light tracking-tight">projects</h1>
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={() => refetch()}
					className={isFetching ? "animate-spin" : ""}
					aria-label="Refresh projects"
				>
					<RefreshCw />
				</Button>
			</div>

			<ul className="space-y-3 text-sm">
				{repos.map((repo, i) => (
					<motion.li
						key={repo.name}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: i * 0.04,
							duration: 0.3,
							ease: [0.22, 1, 0.36, 1],
						}}
						className="flex items-baseline gap-2"
					>
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium shrink-0"
						>
							{repo.name.toLowerCase()}
						</a>
						{repo.stargazers_count > 0 && (
							<span className="text-muted-foreground text-xs flex items-center gap-0.5 shrink-0">
								<Star className="size-3" />
								{repo.stargazers_count}
							</span>
						)}
						{repo.language && (
							<span className="text-muted-foreground text-xs flex items-center gap-1 shrink-0">
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
								className="text-muted-foreground"
							>
								<ExternalLink className="size-3" />
							</a>
						)}
						<span className="text-muted-foreground truncate">
							{repo.description?.toLowerCase() || "no description"}
						</span>
					</motion.li>
				))}
			</ul>
		</div>
	);
}
