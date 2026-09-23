// Runs after `vite build` and the SSR build of src/entry-server.ts (see the build script in package.json).
// main.tsx renders over this markup with createRoot rather than hydrating it, because the remaining days
// are counted from the day the page is opened, not the day it was built.
import { readFileSync, rmSync, writeFileSync } from "node:fs";

const ssrDir = new URL("../dist-ssr/", import.meta.url);
const indexHtml = new URL("../dist/index.html", import.meta.url);

const { render } = await import(new URL("entry-server.js", ssrDir).href);
const html = readFileSync(indexHtml, "utf8");
const emptyRoot = /(<div id="root"[^>]*>)\s*(<\/div>)/;
if (!emptyRoot.test(html)) throw new Error("dist/index.html: no empty #root to prerender into");

writeFileSync(indexHtml, html.replace(emptyRoot, (_, open, close) => `${open}${render()}${close}`));
rmSync(ssrDir, { recursive: true, force: true });
