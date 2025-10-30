import { useCallback, useMemo, useState } from "react";
import Header from "./components/Header";
import CssInput from "./components/CssInput";
import SuggestionsPanel from "./components/SuggestionsPanel";
import HowToUse from "./components/HowToUse";

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function px(n) {
  if (n == null) return null;
  const m = String(n).trim().match(/(-?\d*\.?\d+)(px)?/i);
  return m ? parseFloat(m[1]) : null;
}

function parseBoxShorthand(v) {
  const parts = v.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  if (parts.length >= 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  return {};
}

const spacingScalePx = new Map([
  [0, "0"],
  [1, "0.25rem"], // 4px
  [2, "0.5rem"], // 8px
  [3, "0.75rem"], // 12px
  [4, "1rem"], // 16px
  [5, "1.25rem"], // 20px
  [6, "1.5rem"], // 24px
  [7, "1.75rem"], // 28px
  [8, "2rem"], // 32px
  [9, "2.25rem"], // 36px
  [10, "2.5rem"], // 40px
  [11, "2.75rem"], // 44px
  [12, "3rem"], // 48px
  [14, "3.5rem"], // 56px
  [16, "4rem"], // 64px
  [20, "5rem"], // 80px
  [24, "6rem"], // 96px
  [28, "7rem"], // 112px
  [32, "8rem"], // 128px
  [36, "9rem"], // 144px
  [40, "10rem"], // 160px
  [44, "11rem"], // 176px
  [48, "12rem"], // 192px
  [52, "13rem"], // 208px
  [56, "14rem"], // 224px
  [60, "15rem"], // 240px
  [64, "16rem"], // 256px
  [72, "18rem"], // 288px
  [80, "20rem"], // 320px
  [96, "24rem"], // 384px
]);

const spacingPxToKey = Array.from(spacingScalePx.entries()).reduce((acc, [k, rem]) => {
  const p = Math.round(parseFloat(rem) * 16);
  acc[p] = k === 0 ? "0" : String(k);
  return acc;
}, {});

function spacingToClass(prefix, value, config) {
  // return class + info about config suggestion if not on scale
  const p = px(value);
  if (p == null) return { util: null, arbitrary: `${prefix}-[${value}]` };
  if (p in spacingPxToKey) return { util: `${prefix}-${spacingPxToKey[p]}` };
  // try half steps like 0.5 (2px), 1.5 (6px), 2.5 (10px)
  if (p === 2) return { util: `${prefix}-0.5` };
  if (p === 6) return { util: `${prefix}-1.5` };
  if (p === 10) return { util: `${prefix}-2.5` };
  config.spacing.add(p);
  return { util: null, arbitrary: `${prefix}-[${p}px]` };
}

function colorToArbitrary(prop, value) {
  // supports hex, rgb/a, hsl/a
  const v = value.trim();
  return `${prop}-[${v}]`;
}

function fontSizeToClass(v) {
  const p = px(v);
  if (p == null) return null;
  const map = [
    [12, "text-xs"],
    [14, "text-sm"],
    [16, "text-base"],
    [18, "text-lg"],
    [20, "text-xl"],
    [24, "text-2xl"],
    [30, "text-3xl"],
    [36, "text-4xl"],
    [48, "text-5xl"],
    [60, "text-6xl"],
    [72, "text-7xl"],
    [96, "text-8xl"],
    [128, "text-9xl"],
  ];
  let best = null;
  for (const [pxv, cls] of map) if (pxv === p) best = cls;
  return best || `text-[${p}px]`;
}

function fontWeightToClass(v) {
  const n = parseInt(v, 10);
  if (!isNaN(n)) {
    if (n <= 300) return "font-light";
    if (n <= 400) return "font-normal";
    if (n <= 500) return "font-medium";
    if (n <= 600) return "font-semibold";
    if (n <= 700) return "font-bold";
    if (n <= 800) return "font-extrabold";
    return "font-black";
  }
  const map = { normal: "font-normal", bold: "font-bold", bolder: "font-extrabold", lighter: "font-light" };
  return map[v] || null;
}

function radiusToClass(v, config) {
  const p = px(v);
  if (p == null) return `rounded-[${v}]`;
  const map = [
    [0, "rounded-none"],
    [2, "rounded-sm"],
    [4, "rounded"],
    [6, "rounded-md"],
    [8, "rounded-lg"],
    [12, "rounded-xl"],
    [16, "rounded-2xl"],
    [24, "rounded-3xl"],
  ];
  const hit = map.find(([pxv]) => pxv === p);
  if (hit) return hit[1];
  config.radius.add(p);
  return `rounded-[${p}px]`;
}

function shadowToClass(v) {
  // Fallback to arbitrary property for exact match
  return `[box-shadow:${v}]`;
}

function borderToClasses(value, config) {
  // naive parse: width style color
  const parts = value.split(/\s+/).filter(Boolean);
  let width = parts.find((p) => /px$/.test(p));
  let color = parts.find((p) => /^#|rgb|hsl/.test(p));
  const out = [];
  if (width) {
    const p = px(width);
    if (p === 0) out.push("border-0");
    else if (p === 1) out.push("border");
    else out.push(`border-[${p}px]`);
  } else {
    out.push("border");
  }
  if (color) out.push(colorToArbitrary("border", color));
  return out;
}

function dimensionToClass(prop, v, config) {
  const p = px(v);
  const prefix = prop === "width" ? "w" : "h";
  if (/%$/.test(v)) {
    const n = parseFloat(v);
    const fracs = { 25: "1/4", 33.333: "1/3", 50: "1/2", 66.666: "2/3", 75: "3/4", 100: "full" };
    const key = Object.keys(fracs).find((k) => Math.abs(parseFloat(k) - n) < 0.01);
    return key ? `${prefix}-${fracs[key]}` : `${prefix}-[${v}]`;
  }
  if (p == null) return `${prefix}-[${v}]`;
  if (p in spacingPxToKey) return `${prefix}-${spacingPxToKey[p]}`;
  if (p === 2) return `${prefix}-0.5`;
  if (p === 6) return `${prefix}-1.5`;
  if (p === 10) return `${prefix}-2.5`;
  config.spacing.add(p);
  return `${prefix}-[${p}px]`;
}

function lineHeightToClass(v) {
  const map = {
    normal: "leading-normal",
    none: "leading-none",
    tight: "leading-tight",
    snug: "leading-snug",
    relaxed: "leading-relaxed",
    loose: "leading-loose",
  };
  if (map[v]) return map[v];
  const p = px(v);
  if (p) return `leading-[${p}px]`;
  if (/^\d+(\.\d+)?$/.test(v)) return `leading-[${v}]`;
  return null;
}

function letterSpacingToClass(v) {
  const map = {
    "-0.05em": "tracking-tighter",
    "-0.025em": "tracking-tight",
    "0": "tracking-normal",
    "0em": "tracking-normal",
    "0.025em": "tracking-wide",
    "0.05em": "tracking-wider",
    "0.1em": "tracking-widest",
  };
  if (map[v]) return map[v];
  return `tracking-[${v}]`;
}

function parseCSS(text) {
  const cleaned = text.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "").trim();
  const body = cleaned.includes("{") ? cleaned.slice(cleaned.indexOf("{") + 1, cleaned.lastIndexOf("}")) : cleaned;
  const decls = body
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const i = s.indexOf(":");
      if (i === -1) return null;
      const prop = s.slice(0, i).trim().toLowerCase();
      const val = s.slice(i + 1).trim();
      return [prop, val];
    })
    .filter(Boolean);
  return decls;
}

function convertCssToTailwind(text) {
  const decls = parseCSS(text);
  const utilities = new Set();
  const singles = new Set();
  const arbitrary = new Set();
  const config = { spacing: new Set(), radius: new Set(), colors: new Set() };
  const notes = [];

  for (const [prop, val] of decls) {
    switch (prop) {
      case "display": {
        const map = { flex: "flex", block: "block", inline: "inline", "inline-block": "inline-block", grid: "grid" };
        if (map[val]) utilities.add(map[val]), singles.add(map[val]);
        else arbitrary.add(`[display:${val}]`);
        break;
      }
      case "justify-content": {
        const map = { center: "justify-center", start: "justify-start", end: "justify-end", between: "justify-between", around: "justify-around", evenly: "justify-evenly" };
        utilities.add(map[val] || `[justify-content:${val}]`);
        break;
      }
      case "align-items": {
        const map = { center: "items-center", start: "items-start", end: "items-end", baseline: "items-baseline", stretch: "items-stretch" };
        utilities.add(map[val] || `[align-items:${val}]`);
        break;
      }
      case "flex-direction": {
        const map = { row: "flex-row", column: "flex-col", "row-reverse": "flex-row-reverse", "column-reverse": "flex-col-reverse" };
        utilities.add(map[val] || `[flex-direction:${val}]`);
        break;
      }
      case "gap": {
        const { util, arbitrary: a } = spacingToClass("gap", val, config);
        if (util) utilities.add(util);
        else arbitrary.add(a);
        break;
      }
      case "padding": {
        const box = parseBoxShorthand(val);
        const t = spacingToClass("pt", box.top, config);
        const r = spacingToClass("pr", box.right, config);
        const b = spacingToClass("pb", box.bottom, config);
        const l = spacingToClass("pl", box.left, config);
        [t, r, b, l].forEach(({ util, arbitrary: a }) => (util ? utilities.add(util) : arbitrary.add(a)));
        break;
      }
      case "margin": {
        const box = parseBoxShorthand(val);
        const t = spacingToClass("mt", box.top, config);
        const r = spacingToClass("mr", box.right, config);
        const b = spacingToClass("mb", box.bottom, config);
        const l = spacingToClass("ml", box.left, config);
        [t, r, b, l].forEach(({ util, arbitrary: a }) => (util ? utilities.add(util) : arbitrary.add(a)));
        break;
      }
      case "background-color": {
        const cls = colorToArbitrary("bg", val);
        utilities.add(cls);
        arbitrary.add(cls);
        config.colors.add(val.trim());
        break;
      }
      case "color": {
        const cls = colorToArbitrary("text", val);
        utilities.add(cls);
        arbitrary.add(cls);
        config.colors.add(val.trim());
        break;
      }
      case "border": {
        borderToClasses(val, config).forEach((c) => utilities.add(c));
        break;
      }
      case "border-radius": {
        const cls = radiusToClass(val, config);
        utilities.add(cls);
        break;
      }
      case "box-shadow": {
        const cls = shadowToClass(val);
        utilities.add(cls);
        arbitrary.add(cls);
        break;
      }
      case "width":
      case "height": {
        utilities.add(dimensionToClass(prop, val, config));
        break;
      }
      case "text-align": {
        const map = { left: "text-left", center: "text-center", right: "text-right", justify: "text-justify" };
        utilities.add(map[val] || `[text-align:${val}]`);
        break;
      }
      case "font-size": {
        const cls = fontSizeToClass(val);
        utilities.add(cls);
        break;
      }
      case "font-weight": {
        const cls = fontWeightToClass(val);
        if (cls) utilities.add(cls);
        else arbitrary.add(`[font-weight:${val}]`);
        break;
      }
      case "line-height": {
        const cls = lineHeightToClass(val);
        if (cls) utilities.add(cls);
        else arbitrary.add(`[line-height:${val}]`);
        break;
      }
      case "letter-spacing": {
        const cls = letterSpacingToClass(val);
        utilities.add(cls);
        break;
      }
      default: {
        // generic arbitrary property support
        arbitrary.add(`[${prop}:${val}]`);
        notes.push(`No direct utility for \"${prop}\" — used arbitrary property.`);
      }
    }
  }

  // Derive singles: ones that directly map from single declarations
  decls.forEach(([prop, val]) => {
    if (prop === "display") return; // already handled
    // Heuristic: include utilities that clearly represent a single property
    if (prop.startsWith("padding") || prop === "padding") return; // skip, too many
    if (prop.startsWith("margin") || prop === "margin") return;
  });

  const utilList = Array.from(utilities);
  const arbitraryList = Array.from(arbitrary).filter((c) => !utilList.includes(c));

  const applySnippet = utilList.length
    ? `@layer components {\n  .generated-class {\n    @apply ${utilList.join(" ")};\n  }\n}`
    : "";

  const configEntries = [];
  if (config.spacing.size > 0)
    configEntries.push({ key: "spacing", value: Object.fromEntries(Array.from(config.spacing).map((p) => [p + "px", `${p}px`])) });
  if (config.radius.size > 0)
    configEntries.push({ key: "borderRadius", value: Object.fromEntries(Array.from(config.radius).map((p) => [p + "px", `${p}px`])) });
  if (config.colors.size > 0)
    configEntries.push({ key: "colors", value: Object.fromEntries(Array.from(config.colors).map((c) => [c.replace(/[^a-zA-Z0-9]/g, ""), c])) });

  return {
    utilities: utilList,
    singles: Array.from(singles),
    arbitrary: arbitraryList,
    applySnippet,
    config: configEntries,
    notes,
  };
}

export default function App() {
  const [css, setCss] = useState("");
  const results = useMemo(() => convertCssToTailwind(css), [css]);

  const handleConvert = useCallback((text) => setCss(text), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <Header />
      <main>
        <section className="max-w-6xl mx-auto px-6 pt-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">From CSS to Tailwind in seconds</h2>
            <p className="mt-2 text-gray-600">Paste your styles. Get multiple Tailwind-ready options: utilities, @apply, and config hints.</p>
          </div>
        </section>

        <CssInput value={css} onChange={setCss} onConvert={handleConvert} />
        <SuggestionsPanel results={results} />
        <HowToUse />
      </main>
      <footer className="py-10 text-center text-sm text-gray-500">
        Built with ❤️ for the Tailwind community
      </footer>
    </div>
  );
}
