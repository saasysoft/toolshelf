interface DimensionMeta {
  title: string;
  description: string;
}

const DIMENSION_META: Record<string, DimensionMeta> = {
  // Languages
  python: { title: 'Python', description: 'Python developers' },
  typescript: { title: 'TypeScript', description: 'TypeScript projects' },
  javascript: { title: 'JavaScript', description: 'JavaScript development' },
  rust: { title: 'Rust', description: 'Rust developers' },
  go: { title: 'Go', description: 'Go (Golang) projects' },
  java: { title: 'Java', description: 'Java development' },
  ruby: { title: 'Ruby', description: 'Ruby developers' },
  php: { title: 'PHP', description: 'PHP projects' },
  swift: { title: 'Swift', description: 'Swift and iOS development' },
  kotlin: { title: 'Kotlin', description: 'Kotlin and Android development' },
  csharp: { title: 'C#', description: 'C# and .NET development' },
  cpp: { title: 'C++', description: 'C++ projects' },
  shell: { title: 'Shell', description: 'shell scripting' },
  lua: { title: 'Lua', description: 'Lua projects' },
  elixir: { title: 'Elixir', description: 'Elixir developers' },
  zig: { title: 'Zig', description: 'Zig development' },
  // Platforms / works_with
  docker: { title: 'Docker', description: 'Docker workflows' },
  kubernetes: { title: 'Kubernetes', description: 'Kubernetes clusters' },
  vscode: { title: 'VS Code', description: 'Visual Studio Code' },
  neovim: { title: 'Neovim', description: 'Neovim editors' },
  vim: { title: 'Vim', description: 'Vim editors' },
  github: { title: 'GitHub', description: 'GitHub repositories' },
  gitlab: { title: 'GitLab', description: 'GitLab projects' },
  aws: { title: 'AWS', description: 'Amazon Web Services' },
  gcp: { title: 'GCP', description: 'Google Cloud Platform' },
  azure: { title: 'Azure', description: 'Microsoft Azure' },
  linux: { title: 'Linux', description: 'Linux systems' },
  macos: { title: 'macOS', description: 'macOS systems' },
  windows: { title: 'Windows', description: 'Windows systems' },
  nodejs: { title: 'Node.js', description: 'Node.js development' },
  react: { title: 'React', description: 'React projects' },
  nextjs: { title: 'Next.js', description: 'Next.js applications' },
  terraform: { title: 'Terraform', description: 'Terraform infrastructure' },
  postgresql: { title: 'PostgreSQL', description: 'PostgreSQL databases' },
  mysql: { title: 'MySQL', description: 'MySQL databases' },
  redis: { title: 'Redis', description: 'Redis caching' },
  mongodb: { title: 'MongoDB', description: 'MongoDB databases' },
  supabase: { title: 'Supabase', description: 'Supabase projects' },
  firebase: { title: 'Firebase', description: 'Firebase applications' },
  vercel: { title: 'Vercel', description: 'Vercel deployments' },
  openai: { title: 'OpenAI', description: 'OpenAI integration' },
  anthropic: { title: 'Anthropic', description: 'Anthropic Claude integration' },
  ollama: { title: 'Ollama', description: 'Ollama local AI' },
  git: { title: 'Git', description: 'Git workflows' },
  npm: { title: 'npm', description: 'npm packages' },
  pip: { title: 'pip', description: 'pip packages' },
  'docker-compose': { title: 'Docker Compose', description: 'Docker Compose workflows' },
  'claude-code': { title: 'Claude Code', description: 'Claude Code integration' },
  'claude-desktop': { title: 'Claude Desktop', description: 'Claude Desktop' },
  claude: { title: 'Claude', description: 'Claude AI integration' },
};

const CATEGORY_DISPLAY: Record<string, string> = {
  'mcp-servers': 'MCP Server',
  'cli-tools': 'CLI',
  'ai-coding': 'AI Coding',
  'self-hosted': 'Self-Hosted',
  'developer-productivity': 'Developer Productivity',
  'data-tools': 'Data',
  'devops-infra': 'DevOps & Infrastructure',
  'security': 'Security',
  'media-design': 'Media & Design',
  'automation': 'Automation',
};

// Map URL slug → actual array values stored in Supabase
// Only needed for values where slugify(value) !== value
const SLUG_TO_VALUES: Record<string, string[]> = {
  csharp: ['c#', 'csharp'],
  cpp: ['c++'],
  'emacs-lisp': ['emacs lisp'],
  'jupyter-notebook': ['jupyter notebook'],
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Given a URL slug, return the original array values to query against */
export function slugToQueryValues(slug: string): string[] {
  if (SLUG_TO_VALUES[slug]) return SLUG_TO_VALUES[slug];
  // Most values are already the slug (e.g., "python", "docker", "git")
  return [slug];
}

export function getDimensionMeta(slug: string): DimensionMeta {
  if (DIMENSION_META[slug]) return DIMENSION_META[slug];
  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { title, description: `${title} projects` };
}

export function getCategoryDisplay(categorySlug: string): string {
  return CATEGORY_DISPLAY[categorySlug] || categorySlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
