import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Category, Entry } from "@patchwork/core";
import { api } from "../lib/api.js";
import { MarkdownEditor } from "../components/MarkdownEditor.js";

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "improved", label: "Improved", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "fixed", label: "Fixed", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "breaking", label: "Breaking", color: "bg-red-100 text-red-800 border-red-300" },
];

export function EditEntry() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug || !id) return;
    api.entries.get(slug, id).then((res) => {
      setEntry(res.data);
      setTitle(res.data.title);
      setContent(res.data.content);
      setCategories(res.data.categories);
      setLoading(false);
    });
  }, [slug, id]);

  function toggleCategory(cat: Category) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !id || categories.length === 0) {
      setError("Select at least one category");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.entries.update(slug, id, { title, content, categories });
      navigate(`/projects/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  }

  async function handlePublish() {
    if (!slug || !id) return;
    setSubmitting(true);
    try {
      await api.entries.update(slug, id, {
        title,
        content,
        categories,
        publishedAt: new Date().toISOString(),
      });
      navigate(`/projects/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
      setSubmitting(false);
    }
  }

  async function handleUnpublish() {
    if (!slug || !id) return;
    setSubmitting(true);
    try {
      await api.entries.unpublish(slug, id);
      navigate(`/projects/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unpublish");
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!entry) return <p className="text-red-500">Entry not found</p>;

  const isPublished = !!entry.publishedAt;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Entry</h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isPublished
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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

        <MarkdownEditor value={content} onChange={setContent} />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>

          {isPublished ? (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={submitting}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-100 text-sm font-medium disabled:opacity-50"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
            >
              Publish
            </button>
          )}

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
