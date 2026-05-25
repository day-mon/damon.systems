import { useQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import type { GitHubReposRequest, GitHubRepo } from './types';

export const githubKeys = createQueryKeys('github', {
  repos: (params?: GitHubReposRequest) => [params],
});

interface UseGithubReposParams extends Partial<GitHubReposRequest> {
  select?: (data: GitHubRepo[]) => GitHubRepo[];
}

export function useGithubRepos({
  username = 'day-mon',
  per_page = 100,
  select,
}: UseGithubReposParams = {}) {
  return useQuery({
    queryKey: githubKeys.repos({ username, per_page }).queryKey,
    queryFn: async () => {
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=${per_page}`,
        { headers: { 'X-Github-Api-Version': '2022-11-28' } },
      );
      return res.json() as Promise<GitHubRepo[]>;
    },
    select,
    staleTime: Infinity,
  });
}
