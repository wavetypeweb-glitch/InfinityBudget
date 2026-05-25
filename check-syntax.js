const { execFileSync } = require("child_process");
const { readdirSync, statSync } = require("fs");
const { join, resolve } = require("path");

const root = resolve(__dirname, "..");
const scanDirs = ["src", "scripts"].map((dir) => join(root, dir));
const topLevelFiles = ["server.js"].map((file) => join(root, file));

function collectJsFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return collectJsFiles(fullPath);
    }

    return entry.endsWith(".js") ? [fullPath] : [];
  });
}

const files = [
  ...topLevelFiles,
  ...scanDirs.flatMap(collectJsFiles)
];

for (const file of files) {
  execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
}

console.log(`Syntax check passed for ${files.length} files.`);
