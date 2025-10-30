export default function HowToUse() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white shadow-sm border">
          <h3 className="font-semibold mb-2">1) Paste raw CSS</h3>
          <p className="text-sm text-gray-600">Drop any declaration block. Shorthands like margin, padding are supported.</p>
        </div>
        <div className="p-5 rounded-2xl bg-white shadow-sm border">
          <h3 className="font-semibold mb-2">2) Pick your style</h3>
          <p className="text-sm text-gray-600">Choose from multi-utility classes, single-property matches, or a ready-to-@apply snippet.</p>
        </div>
        <div className="p-5 rounded-2xl bg-white shadow-sm border">
          <h3 className="font-semibold mb-2">3) Grow together</h3>
          <p className="text-sm text-gray-600">This is built to be community-first. Share feedback and recipes you love.</p>
        </div>
      </div>
    </section>
  );
}
