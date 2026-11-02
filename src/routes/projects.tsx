import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, RefreshCw, Star } from "lucide-react";
import { m, useReducedMotion } from "motion/react";

import { EXCLUDED_REPOS, getLanguageColor } from "#/constants";
import { useGithubRepos } from "#/queries/github/queries";
import type { GitHubRepo } from "#/queries/github/types";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export const Route = createFileRoute("/projects")({
	head: () => ({
		meta: [
			{ title: "damon | projects" },
			{
				name: "description",
				content: "some of the things I have worked on via github",
			},
		],
	}),
	component: Projects,
});

function Projects() {
	return (
		<main className="mx-auto max-w-3xl px-8 pt-12 pb-20">
			<ProjectsList />
		</main>
	);
}

function ProjectsError({ message }: { message: string }) {
	return <p>error loading projects: {message}</p>;
}

/*
skeleton rules followed here:
- static chrome is REAL: the h1 and refresh affordance live in markup,
  not as grey boxes pretending to be loading.
- pulse rows are statistical, not literal: name widths sample the real
  star-sorted kebab-case distribution, only ~30% of rows have a star
  count (loaded state shows them only when stars > 0), and description
  bars vary in length instead of forming a uniform wall.
- rows stagger in like the loaded list does (30ms) so the skeleton ->
  data swap reads as "the data arrived", not "the layout rebuilt".
*/

interface SkeletonRow {
	id: string;
	name: number;
	stars: boolean;
	icon: boolean;
	desc: number;
}

const ROWS: SkeletonRow[] = [
	{ id: "s01", name: 120, stars: true, icon: true, desc: 64 },
	{ id: "s02", name: 148, stars: true, icon: false, desc: 47 },
	{ id: "s03", name: 96, stars: false, icon: true, desc: 71 },
	{ id: "s04", name: 104, stars: true, icon: false, desc: 38 },
	{ id: "s05", name: 88, stars: false, icon: true, desc: 55 },
	{ id: "s06", name: 132, stars: true, icon: false, desc: 62 },
	{ id: "s07", name: 116, stars: false, icon: true, desc: 44 },
	{ id: "s08", name: 92, stars: false, icon: false, desc: 76 },
	{ id: "s09", name: 152, stars: true, icon: true, desc: 52 },
	{ id: "s10", name: 108, stars: false, icon: false, desc: 41 },
	{ id: "s11", name: 124, stars: true, icon: true, desc: 68 },
	{ id: "s12", name: 84, stars: false, icon: false, desc: 59 },
	{ id: "s13", name: 140, stars: true, icon: true, desc: 36 },
	{ id: "s14", name: 100, stars: false, icon: false, desc: 73 },
	{ id: "s15", name: 112, stars: false, icon: true, desc: 48 },
	{ id: "s16", name: 96, stars: true, icon: false, desc: 61 },
	{ id: "s17", name: 128, stars: false, icon: true, desc: 43 },
	{ id: "s18", name: 92, stars: false, icon: false, desc: 69 },
	{ id: "s19", name: 108, stars: false, icon: true, desc: 57 },
];

function ProjectsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex h-8 items-center gap-3">
				<h1 className="m-0 text-2xl font-light tracking-tight">projects</h1>
				{/* mirroring the refresh button's disabled-spinning state */}
				<RefreshCw size={14} className="animate-spin opacity-40" />
			</div>

			<ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
				{ROWS.map(({ id, name, stars, icon, desc }, i) => (
					<li
						key={id}
						className="flex h-[21px] animate-in fade-in items-center gap-2 duration-200"
						style={{ animationDelay: `${i * 30}ms` }}
					>
						<Skeleton className="h-3.5 rounded-[1px]" style={{ width: name }} />
						{stars && <Skeleton className="h-3 w-[30px] rounded-[1px]" />}
						<Skeleton className="h-3 w-9 rounded-[1px]" />
						{icon && <Skeleton className="size-3 rounded-[1px]" />}
						<Skeleton
							className="h-3 rounded-[1px]"
							style={{ width: `${desc}%` }}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}


function ProjectsList() {
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


