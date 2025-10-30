import { useEffect, useMemo, useState } from "react";
import { ClipboardPaste, Eraser, Check, Copy } from "lucide-react";

export default function CssInput({ value, onChange, onConvert }) {
  const [copied, setCopied] = useState(false);

  const example = useMemo(
    () => `/* Paste any CSS */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  gap: 8px;
  background-color: #4f46e5;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}
`,
    []
  );

  useEffect(() => {
    const id = setTimeout(() => onConvert?.(value), 250);
    return () => clearTimeout(id);
  }, [value, onConvert]);

  return (
    <section className="max-w-6xl mx-auto px-6 pt-10">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <span className="text-sm font-medium text-gray-700">CSS Input</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange(example)}
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                <ClipboardPaste className="h-4 w-4" />
                Paste example
              </button>
              <button
                onClick={() => onChange("")}
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Eraser className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={example}
            className="w-full h-[320px] p-4 font-mono text-sm outline-none resize-none"
          />
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
            <span className="text-xs text-gray-500">Tip: Shorthands like margin/padding are supported</span>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(value || example);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white border hover:bg-gray-50"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              Copy input
            </button>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border p-6">
          <h3 className="font-semibold mb-2">What you get</h3>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Multi-class Tailwind utilities that match your CSS</li>
            <li>Single-property matches when available</li>
            <li>A ready-to-use @apply snippet</li>
            <li>Suggestions to extend your Tailwind config for custom values</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
