import { Rocket } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-white grid place-items-center shadow-lg">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Tailwind Class Generator</h1>
            <p className="text-xs text-muted-foreground text-gray-500">Paste CSS → Get Tailwind utilities</p>
          </div>
        </div>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Open Source
        </a>
      </div>
    </header>
  );
}
