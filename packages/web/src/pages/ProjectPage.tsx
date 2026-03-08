import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Project, Entry } from "@patchwork/core";
import { api } from "../lib/api.js";

const CATEGORY_COLORS: Record<string, string> = {
  new: "bg-green-100 text-green-800",
  improved: "bg-blue-100 text-blue-800",
  fixed: "bg-amber-100 text-amber-800",
  breaking: "bg-red-100 text-red-800",
};

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([api.projects.get(slug), api.entries.list(slug)]).then(
      ([projRes, entriesRes]) => {
        setProject(projRes.data);
        setEntries(entriesRes.data);
        setLoading(false);
      }
    );
  }, [slug]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!project) return <p className="text-red-500">Project not found</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500">/{project.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`http://localhost:3001/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            View Public Page
          </a>
          <Link
            to={`/projects/${slug}/new`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            New Entry
          </Link>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-2">No changelog entries yet</p>
          <p className="text-sm text-gray-400">
            Create your first entry to start documenting changes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              to={`/projects/${slug}/entries/${entry.id}`}
              className="block p-5 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {entry.title}
                </h2>
                <div className="flex items-center gap-2 ml-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      entry.publishedAt
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {entry.publishedAt ? "Published" : "Draft"}
                  </span>
                  <time className="text-xs text-gray-400 whitespace-nowrap">
                    {entry.publishedAt
                      ? new Date(entry.publishedAt).toLocaleDateString()
                      : new Date(entry.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {entry.categories.map((cat) => (
                  <span
                    key={cat}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {entry.content}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
