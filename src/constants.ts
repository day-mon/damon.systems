export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
};

export const EXCLUDED_REPOS = [
  'school-bot',
  'ImageSize',
  'silly-zach',
  'Labs',
  'PittJohnstownAPI',
];

export function getLanguageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || '#6e7781';
}
