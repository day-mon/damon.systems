import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";
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
		queryFn: async () => {
			const res = await fetch(
				`https://api.github.com/users/${username}/repos?per_page=${per_page}`,
				{ headers: { "X-Github-Api-Version": "2022-11-28" } },
			);
			if (!res.ok) {
				throw new Error(`github api failed: ${res.status}`);
			}
			return res.json() as Promise<GitHubRepo[]>;
		},
		select,
		staleTime: Infinity,
	});
}
