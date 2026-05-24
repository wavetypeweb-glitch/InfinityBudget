const { execFileSync } = require("child_process");
const { readdirSync, statSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..", "src");

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

const files = collectJsFiles(root);

for (const file of files) {
  execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
}

console.log(`Syntax check passed for ${files.length} files.`);
