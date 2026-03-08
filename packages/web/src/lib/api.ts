import type { Project, Entry, ApiResponse, PaginatedResponse } from "@patchwork/core";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
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

type AuthUser = { id: string; email: string };

export const api = {
  auth: {
    register: (data: { email: string; password: string }) =>
      request<ApiResponse<AuthUser>>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<ApiResponse<AuthUser>>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: () =>
      request<ApiResponse<{ ok: boolean }>>("/auth/logout", {
        method: "POST",
      }),
    me: () => request<ApiResponse<AuthUser>>("/auth/me"),
  },
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
    list: (slug: string, page = 1, q?: string) => {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set("q", q);
      return request<PaginatedResponse<Entry>>(`/projects/${slug}/entries?${params}`);
    },
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
    update: (
      slug: string,
      id: string,
      data: { title?: string; content?: string; categories?: string[]; publishedAt?: string }
    ) =>
      request<ApiResponse<Entry>>(`/projects/${slug}/entries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    unpublish: (slug: string, id: string) =>
      request<ApiResponse<Entry>>(`/projects/${slug}/entries/${id}`, {
        method: "PUT",
        body: JSON.stringify({ publishedAt: null }),
      }),
    delete: (slug: string, id: string) =>
      request<ApiResponse<{ deleted: boolean }>>(`/projects/${slug}/entries/${id}`, {
        method: "DELETE",
      }),
  },
  apiKeys: {
    list: (slug: string) =>
      request<ApiResponse<Array<{ id: string; projectId: string; name: string; lastUsedAt: string | null; createdAt: string }>>>(`/projects/${slug}/api-keys`),
    create: (slug: string, data: { name: string }) =>
      request<ApiResponse<{ id: string; projectId: string; name: string; key: string; createdAt: string }>>(`/projects/${slug}/api-keys`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (slug: string, keyId: string) =>
      request<ApiResponse<{ deleted: boolean }>>(`/projects/${slug}/api-keys/${keyId}`, {
        method: "DELETE",
      }),
  },
};
