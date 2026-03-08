import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Category } from "@patchwork/core";
import { api } from "../lib/api.js";

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "improved", label: "Improved", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "fixed", label: "Fixed", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "breaking", label: "Breaking", color: "bg-red-100 text-red-800 border-red-300" },
];

export function NewEntry() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleCategory(cat: Category) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || categories.length === 0) {
      setError("Select at least one category");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.entries.create(slug, {
        title,
        content,
        categories,
        publishedAt: publish ? new Date().toISOString() : undefined,
      });
      navigate(`/projects/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Entry</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="What changed?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => toggleCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  categories.includes(cat.value)
                    ? cat.color
                    : "bg-gray-50 text-gray-400 border-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content (Markdown)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono min-h-[200px]"
            placeholder="Describe the changes..."
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="rounded"
            />
            Publish immediately
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Creating..." : publish ? "Publish Entry" : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/projects/${slug}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
