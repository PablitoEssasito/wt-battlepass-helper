import { createElement } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

// Build-time only: scripts/prerender.js puts this markup into dist/index.html,
// so the page has real content before the script loads and for crawlers that never run it.
export const render = () => renderToString(createElement(App));
