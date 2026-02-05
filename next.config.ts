import type { NextConfig } from "next";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

// Get version from package.json at build time
function getVersion() {
  try {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf-8")
    );
    return packageJson.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

// Get git info at build time
function getGitInfo() {
  // First try Vercel's environment variables (available during Vercel builds)
  const vercelCommitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (vercelCommitSha) {
    return {
      commitHash: vercelCommitSha.substring(0, 7),
      commitDate: new Date().toISOString(),
    };
  }

  // Fall back to git commands for local builds
  try {
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    const commitDate = execSync("git log -1 --format=%ci").toString().trim();
    return { commitHash, commitDate };
  } catch {
    return { commitHash: "dev", commitDate: new Date().toISOString() };
  }
}

const gitInfo = getGitInfo();
const version = getVersion();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_BUILD_ID: gitInfo.commitHash,
    NEXT_PUBLIC_BUILD_DATE: gitInfo.commitDate,
  },
};

export default nextConfig;
