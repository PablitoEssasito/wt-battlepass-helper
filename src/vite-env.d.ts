/// <reference types="vite/client" />
declare const APP_VERSION: string;

interface Window {
  /** Absent whenever an ad blocker drops the Google tag, so always call it optionally. */
  gtag?: (...args: unknown[]) => void;
}
declare module "*.md";