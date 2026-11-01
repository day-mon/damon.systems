import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { GitHubRepo, GitHubReposRequest } from "./types";

export const githubKeys = createQueryKeys("github", {
	repos: (params?: GitHubReposRequest) => [params],
});

export function useGithubRepos({
	username = "day-mon",
	per_page = 100,
	select,
}: Partial<GitHubReposRequest> & {
	select?: (repos: GitHubRepo[]) => GitHubRepo[];
} = {}) {
	return useQuery({
		queryKey: githubKeys.repos({ username, per_page }).queryKey,
		queryFn: () =>
			ky(`https://api.github.com/users/${username}/repos`, {
				searchParams: { per_page },
				headers: { "X-Github-Api-Version": "2022-11-28" },
				retry: 0,
			}).json<GitHubRepo[]>(),
		select,
		staleTime: Infinity,
	});
}
