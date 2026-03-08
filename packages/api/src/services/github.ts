import { config } from "../config.js";

export type GitHubRelease = {
  tag: string;
  title: string;
  body: string;
  publishedAt: string;
  url: string;
};

export async function fetchReleases(
  owner: string,
  repo: string,
  sinceDate?: Date
): Promise<GitHubRelease[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (config.githubToken) {
    headers.Authorization = `Bearer ${config.githubToken}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases?per_page=30`,
    { headers }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${text}`);
  }

  const data = (await res.json()) as Array<{
    tag_name: string;
    name: string | null;
    body: string | null;
    published_at: string | null;
    draft: boolean;
    prerelease: boolean;
    html_url: string;
  }>;

  let releases = data
    .filter((r) => !r.draft)
    .map((r) => ({
      tag: r.tag_name,
      title: r.name || r.tag_name,
      body: r.body || "",
      publishedAt: r.published_at || new Date().toISOString(),
      url: r.html_url,
    }));

  if (sinceDate) {
    releases = releases.filter(
      (r) => new Date(r.publishedAt) > sinceDate
    );
  }

  return releases;
}

export function parseGithubRepo(repoString: string): { owner: string; repo: string } | null {
  const match = repoString.match(/^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
