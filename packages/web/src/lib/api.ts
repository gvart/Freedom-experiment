import type { Project, Entry, ApiResponse, PaginatedResponse } from "@patchwork/core";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error ?? `Request failed: ${res.status}`);
  }

  return json;
}

export const api = {
  projects: {
    list: () => request<ApiResponse<Project[]>>("/projects"),
    get: (slug: string) => request<ApiResponse<Project>>(`/projects/${slug}`),
    create: (data: { name: string; slug: string; description?: string }) =>
      request<ApiResponse<Project>>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (slug: string) =>
      request<ApiResponse<{ deleted: boolean }>>(`/projects/${slug}`, {
        method: "DELETE",
      }),
  },
  entries: {
    list: (slug: string, page = 1) =>
      request<PaginatedResponse<Entry>>(`/projects/${slug}/entries?page=${page}`),
    get: (slug: string, id: string) =>
      request<ApiResponse<Entry>>(`/projects/${slug}/entries/${id}`),
    create: (
      slug: string,
      data: { title: string; content: string; categories: string[]; publishedAt?: string }
    ) =>
      request<ApiResponse<Entry>>(`/projects/${slug}/entries`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (slug: string, id: string) =>
      request<ApiResponse<{ deleted: boolean }>>(`/projects/${slug}/entries/${id}`, {
        method: "DELETE",
      }),
  },
};
