import type { NextConfig } from "next";

const isWindows = process.platform === "win32";

// Avoid `output: 'standalone'` on Windows because Next tries to create
// symlinks when preparing the standalone output which often fails with
// EPERM unless running as admin or with Developer Mode enabled.
// Use standalone only on non-Windows environments or when explicitly set
// via NEXT_STANDALONE env var.
const nextConfig: NextConfig = {
  /* config options here */
  output:
    process.env.NEXT_STANDALONE === "true"
      ? "standalone"
      : isWindows
      ? undefined
      : "standalone",
};

export default nextConfig;
