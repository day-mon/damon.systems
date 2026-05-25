export interface GitHubReposRequest {
  username?: string;
  per_page?: number;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  private: boolean;
  fork: boolean;
}
