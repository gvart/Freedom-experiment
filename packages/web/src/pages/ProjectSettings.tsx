import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Project } from "@patchwork/core";
import { api } from "../lib/api.js";

type ApiKeyItem = {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export function ProjectSettings() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    Promise.all([api.projects.get(slug), api.apiKeys.list(slug)]).then(
      ([projRes, keysRes]) => {
        setProject(projRes.data);
        setKeys(keysRes.data);
        setLoading(false);
      }
    );
  }, [slug]);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !newKeyName) return;
    setError("");

    try {
      const res = await api.apiKeys.create(slug, { name: newKeyName });
      setRevealedKey(res.data.key);
      setKeys((prev) => [
        ...prev,
        {
          id: res.data.id,
          name: res.data.name,
          lastUsedAt: null,
          createdAt: res.data.createdAt,
        },
      ]);
      setNewKeyName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    }
  }

  async function deleteKey(keyId: string) {
    if (!slug) return;
    await api.apiKeys.delete(slug, keyId);
    setKeys((prev) => prev.filter((k) => k.id !== keyId));
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!project) return <p className="text-red-500">Project not found</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{project.name} — Settings</h1>
        <button
          onClick={() => navigate(`/projects/${slug}`)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to entries
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h2>
        <p className="text-sm text-gray-500 mb-4">
          Use API keys for programmatic access. Keys are shown only once on creation.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {revealedKey && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">
              API key created! Copy it now — you won't see it again.
            </p>
            <code className="block p-2 bg-white border border-green-300 rounded text-sm font-mono break-all">
              {revealedKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(revealedKey);
                setRevealedKey(null);
              }}
              className="mt-2 text-xs text-green-700 hover:text-green-900 font-medium"
            >
              Copy & dismiss
            </button>
          </div>
        )}

        <form onSubmit={createKey} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. CI/CD)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Create Key
          </button>
        </form>

        {keys.length === 0 ? (
          <p className="text-sm text-gray-400">No API keys yet.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{key.name}</p>
                  <p className="text-xs text-gray-400">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt && ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Embeddable Widget</h2>
        <p className="text-sm text-gray-500 mb-4">
          Add a changelog notification widget to your site with a single script tag.
          Users see a floating button that opens a panel with your latest updates.
        </p>
        <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300 whitespace-pre">{`<script src="${window.location.origin}/widget.js"
        data-patchwork-project="${project.id}"
        data-patchwork-color="${(project as any).primaryColor || "#6366f1"}"
        data-patchwork-position="bottom-right">
</script>`}</pre>
        </div>
        <button
          onClick={() => {
            const code = `<script src="${window.location.origin}/widget.js" data-patchwork-project="${project.id}" data-patchwork-color="${(project as any).primaryColor || "#6366f1"}" data-patchwork-position="bottom-right"></script>`;
            navigator.clipboard.writeText(code);
          }}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Copy embed code
        </button>
      </section>
    </div>
  );
}
