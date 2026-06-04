import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root — a stray package-lock.json in the parent Desktop
  // folder otherwise confuses Turbopack's root inference.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
