import { useState } from "react";
import { markdownToHtml } from "@patchwork/core";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className="block text-sm font-medium text-gray-700 flex-1">
          Content (Markdown)
        </label>
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
            !showPreview
              ? "bg-gray-200 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
            showPreview
              ? "bg-gray-200 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Preview
        </button>
      </div>

      {showPreview ? (
        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm min-h-[300px] bg-white prose-preview">
          {value ? (
            <div
              dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
            />
          ) : (
            <p className="text-gray-400 italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono min-h-[300px] resize-y"
          placeholder="Describe the changes in markdown..."
          required
        />
      )}
    </div>
  );
}
