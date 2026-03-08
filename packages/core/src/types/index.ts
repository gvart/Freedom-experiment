export type Category = "new" | "improved" | "fixed" | "breaking";

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string;
  createdAt: string;
  updatedAt: string;
};

export type Entry = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  categories: Category[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Subscriber = {
  id: string;
  projectId: string;
  email: string;
  confirmed: boolean;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  projectId: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

export type ApiResponse<T> = {
  data: T;
};

export type ApiError = {
  error: string;
};
