import { useState } from "react";
import { Copy, Check } from "lucide-react";

function CopyButton({ text, label = "Copy" }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1200);
      }}
      className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-white border hover:bg-gray-50"
    >
      {ok ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {ok ? "Copied" : label}
    </button>
  );
}

export default function SuggestionsPanel({ results }) {
  const {
    utilities = [],
    singles = [],
    arbitrary = [],
    applySnippet = "",
    config = [],
    notes = [],
  } = results || {};

  const utilString = utilities.join(" ");
  const singleString = singles.join(" ");
  const arbitraryString = arbitrary.join(" ");

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold">Multi-utility recommendation</h3>
            <CopyButton text={utilString} label="Copy classes" />
          </div>
          <pre className="p-4 text-sm whitespace-pre-wrap font-mono">{utilString || "/* Utilities will appear here */"}</pre>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold">Single-property matches</h3>
            <CopyButton text={singleString} label="Copy single matches" />
          </div>
          <pre className="p-4 text-sm whitespace-pre-wrap font-mono">{singleString || "/* Single-property utilities */"}</pre>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold">Arbitrary utilities (exact values)</h3>
            <CopyButton text={arbitraryString} label="Copy arbitrary" />
          </div>
          <pre className="p-4 text-sm whitespace-pre-wrap font-mono">{arbitraryString || "/* Arbitrary utilities (like bg-[#1f2937]) */"}</pre>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold">Custom class with @apply</h3>
            <CopyButton text={applySnippet} label="Copy snippet" />
          </div>
          <pre className="p-4 text-sm whitespace-pre-wrap font-mono">{applySnippet || "/* @layer components { .my-class { @apply ... } } */"}</pre>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold">Tailwind config suggestions</h3>
          </div>
          <div className="p-4 text-sm">
            {config.length === 0 ? (
              <p className="text-gray-600">No custom config required. All values fit Tailwind's defaults.</p>
            ) : (
              <>
                <p className="text-gray-700 mb-3">Consider extending your theme for these custom values:</p>
                <pre className="p-4 rounded-lg bg-gray-50 border overflow-auto">
{`// tailwind.config.js
module.exports = {
  theme: {
    extend: {
${config.map((c) => `      ${c.key}: ${JSON.stringify(c.value, null, 2).replace(/"([^(")"]+)":/g, '$1:')},`).join("\n")}    }
  }
}`}
                </pre>
              </>
            )}
            {notes?.length > 0 && (
              <ul className="mt-4 list-disc pl-5 space-y-1 text-gray-600">
                {notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
