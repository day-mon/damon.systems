import { ExternalLink, RefreshCw, Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { EXCLUDED_REPOS, getLanguageColor } from "~/constants";
import { useGithubRepos } from "~/queries/github/queries";

export default function ProjectsList() {
	const { data, isLoading, isFetching, error, refetch } = useGithubRepos({
		select: (data) =>
			data
				.filter((repo) => !repo.private)
				.filter((repo) => !repo.fork)
				.filter((repo) => !EXCLUDED_REPOS.includes(repo.name))
				.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<div className="text-muted-foreground">loading...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center p-4 mb-6 bg-destructive/10 rounded-lg">
				<p className="text-destructive">
					Error loading projects: {error.message}
				</p>
			</div>
		);
	}

	const repos = data || [];

	return (
		<TooltipProvider>
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold tracking-tight text-center w-full">
						<span className="text-gray-900 dark:text-white lowercase">
							projects
						</span>
						<span className="block text-lg font-normal mt-1 text-gray-500 dark:text-gray-400 lowercase">
							things i've built
						</span>
					</h1>

					<Button
						variant="ghost"
						size="icon"
						onClick={() => refetch()}
						className={isFetching ? "animate-spin" : ""}
						aria-label="Refresh projects"
					>
						<RefreshCw />
					</Button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					<div className="lg:col-start-3 flex justify-end">
						<span className="text-xs lowercase italic text-shimmer via-github-entrance">
							via github
						</span>
					</div>

					{repos.map((repo, i) => (
						<Card
							key={repo.name}
							className="border-2 border-gray-900 dark:border-white rounded-xl text-center hover:scale-105 hover:shadow-lg transition-all duration-300 project-card-entrance"
							style={{ animationDelay: `${i * 0.05}s` }}
						>
							<CardHeader className="p-5">
								<div className="flex items-center justify-between">
									<CardTitle className="text-xl font-semibold">
										<a
											href={repo.html_url}
											target="_blank"
											rel="noopener noreferrer"
											className="relative"
										>
											<span className="hover-underline">
												{repo.name.toLowerCase()}
											</span>
										</a>
									</CardTitle>
									<div className="flex items-center space-x-3">
										{repo.stargazers_count > 0 && (
											<span className="flex items-center text-sm font-medium">
												<span>{repo.stargazers_count}</span>
												<Star className="ml-1 size-4" />
											</span>
										)}
										{repo.homepage && (
											<Tooltip>
												<TooltipTrigger>
													<a
														href={repo.homepage}
														target="_blank"
														rel="noopener noreferrer"
													>
														<ExternalLink className="size-5 block transform-gpu transition-all hover:scale-125" />
													</a>
												</TooltipTrigger>
												<TooltipContent>
													<p>
														Clicking this will navigate you to {repo.homepage}
													</p>
												</TooltipContent>
											</Tooltip>
										)}
									</div>
								</div>
								{repo.language && (
									<div className="mt-2 flex items-center justify-center">
										<span
											className="inline-block w-3 h-3 rounded-full mr-2"
											style={{
												backgroundColor: getLanguageColor(repo.language),
											}}
										/>
										<span className="text-sm">{repo.language}</span>
									</div>
								)}
							</CardHeader>
							<CardContent className="px-5 pb-5">
								<p className="text-sm mb-4">
									{repo.description?.toLowerCase() || "no description"}
								</p>
								{repo.topics && repo.topics.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-4 justify-center">
										{repo.topics.map((topic) => (
											<span
												key={topic}
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
											>
												{topic}
											</span>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</TooltipProvider>
	);
}
