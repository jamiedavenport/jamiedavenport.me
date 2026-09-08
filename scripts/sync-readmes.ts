import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const start = '<!-- md:include start path="more-by-jamie.md" required=true -->';
const end = "<!-- md:include end -->";
const sourceComment =
  "<!-- Edit the shared source in jamiedavenport/jamiedavenport.me: readme-snippets/more-by-jamie.md. -->";
const notice = "<!-- content below is auto-generated; do not edit -->";
const syncBranch = "docs/sync-more-by-jamie";
const title = "docs: sync more by Jamie";
const maxAttempts = 3;

function command(cwd: string, program: string, args: string[], input?: string) {
  const result = spawnSync(program, args, {
    cwd,
    input,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 10 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GH_PROMPT_DISABLED: "1" },
  });
  return {
    ok: result.status === 0,
    output: result.stdout ?? "",
    error: `${result.stderr ?? ""}${result.error?.message ?? ""}`,
  };
}

function checkedRaw(cwd: string, program: string, args: string[], input?: string) {
  const result = command(cwd, program, args, input);
  if (!result.ok) {
    throw new Error(`${program} ${args[0]} failed: ${result.error || result.output}`);
  }
  return result.output;
}

function checked(cwd: string, program: string, args: string[], input?: string) {
  return checkedRaw(cwd, program, args, input).trim();
}

// Credentials stay in the environment; no token is written to a checkout or URL.
const gitOptions = ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential"];
function git(cwd: string, ...args: string[]) {
  return checked(cwd, "git", [...gitOptions, ...args]);
}

function regularText(path: string) {
  if (!lstatSync(path).isFile()) {
    throw new Error(`${path} must be a regular file, not a symlink`);
  }
  return readFileSync(path, "utf8");
}

function section(text: string) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(eol);
  const first = lines.indexOf(start);
  const last = lines.indexOf(end);
  if (
    (text.match(/<!--\s*md:include\b/gi) ?? []).length !== 2 ||
    first < 1 ||
    last <= first ||
    lines[first - 1] !== sourceComment ||
    text.replaceAll(eol, "").includes("\r") ||
    (eol === "\r\n" && text.replaceAll(eol, "").includes("\n"))
  ) {
    throw new Error(
      "README.md is unprepared: require exactly one include pair on separate lines and the source comment immediately before it; see docs/readme-sync.md",
    );
  }
  const offset = lines.slice(0, first + 1).join(eol).length;
  const ending = lines.slice(0, last).join(eol).length + eol.length;
  return {
    prefix: text.slice(0, offset),
    body: text.slice(offset, ending),
    suffix: text.slice(ending),
    eol,
  };
}

function assertOutsideUnchanged(before: string, after: string) {
  const original = section(before);
  const rendered = section(after);
  if (original.prefix !== rendered.prefix || original.suffix !== rendered.suffix) {
    throw new Error("Rejected README changes outside the managed section");
  }
  return rendered;
}

function weave(checkout: string, source: string) {
  const path = join(checkout, "README.md");
  const before = regularText(path);
  const original = section(before);
  // 0.1.1 scans every Markdown file even with a positional filename. Isolate it.
  const scratch = mkdtempSync(join(tmpdir(), "readme-weaver-"));
  try {
    const normalized = before.replaceAll("\r\n", "\n");
    writeFileSync(join(scratch, "README.md"), normalized);
    checked(scratch, "readme-weaver", [
      "--base-dir",
      join(sourceDirectory, "readme-snippets"),
      "README.md",
    ]);
    const rendered = assertOutsideUnchanged(normalized, regularText(join(scratch, "README.md")));
    // Verify the installed tool's result, then remove its notice and pad content.
    if (rendered.body !== `\n${notice}\n${source}\n`) {
      throw new Error("Unexpected Readme Weaver output; refusing to publish");
    }
    const content = rendered.body.slice(`\n${notice}\n`.length).trim();
    const body = `\n\n${content}\n\n`.replaceAll("\n", original.eol);
    const after = original.prefix + body + original.suffix;
    assertOutsideUnchanged(before, after);
    writeFileSync(path, after);
    return after !== before;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function protectionRejection(message: string) {
  // Auth, permission, transport and generic hook errors must never trigger a PR.
  return /remote: error: GH006: Protected branch update failed\b|remote: error: GH013: Repository rule violations found\b/.test(
    message,
  );
}

function fetchBranch(checkout: string, branch: string) {
  git(checkout, "fetch", "--no-tags", "origin", `refs/heads/${branch}`);
  return git(checkout, "rev-parse", "FETCH_HEAD");
}

function branchHead(checkout: string, branch: string) {
  return (
    git(checkout, "ls-remote", "--heads", "origin", `refs/heads/${branch}`).split(/\s/)[0] ?? ""
  );
}

function pullRequest(checkout: string, repository: string, branch: string, sourceCommit: string) {
  const args = [
    "pr",
    "list",
    "--repo",
    repository,
    "--head",
    syncBranch,
    "--base",
    branch,
    "--state",
    "open",
    "--json",
    "number,url",
  ];
  const prs: unknown = JSON.parse(checked(checkout, "gh", args));
  if (
    !Array.isArray(prs) ||
    !prs.every(
      (pr: unknown): pr is { number: number; url: string } =>
        typeof pr === "object" &&
        pr !== null &&
        "number" in pr &&
        typeof pr.number === "number" &&
        "url" in pr &&
        typeof pr.url === "string",
    )
  ) {
    throw new Error("Unexpected pull request API response");
  }
  if (prs.length > 1) {
    throw new Error("Multiple sync PRs found; resolve duplicates manually");
  }
  const body = `Updates the managed More by Jamie section from jamiedavenport/jamiedavenport.me@${sourceCommit}.\n\nSource: https://github.com/jamiedavenport/jamiedavenport.me/commit/${sourceCommit}\n\nOnly README.md changes. Destination checks and branch rules apply normally.\n`;
  const existing = prs[0];
  if (existing) {
    checked(
      checkout,
      "gh",
      [
        "pr",
        "edit",
        String(existing.number),
        "--repo",
        repository,
        "--title",
        title,
        "--body-file",
        "-",
      ],
      body,
    );
    return `PR-updated: ${existing.url}`;
  }
  const url = checked(
    checkout,
    "gh",
    [
      "pr",
      "create",
      "--repo",
      repository,
      "--head",
      syncBranch,
      "--base",
      branch,
      "--title",
      title,
      "--body-file",
      "-",
    ],
    body,
  );
  return `PR-created: ${url}`;
}

function sync(repository: string, source: string, sourceCommit: string, diffDirectory: string) {
  const checkout = mkdtempSync(join(tmpdir(), "readme-sync-"));
  try {
    const branch = checked(sourceDirectory, "gh", [
      "api",
      `repos/${repository}`,
      "--jq",
      ".default_branch",
    ]);
    git(checkout, "init", "--quiet");
    git(checkout, "remote", "add", "origin", `https://github.com/${repository}.git`);
    git(checkout, "config", "user.name", "github-actions[bot]");
    git(checkout, "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
    let usePR = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const base = fetchBranch(checkout, branch);
      git(checkout, "checkout", "--detach", "--force", base);
      const changed = weave(checkout, source);
      const diff = checkedRaw(checkout, "git", [
        "diff",
        "--no-ext-diff",
        "--no-color",
        "--",
        "README.md",
      ]);
      writeFileSync(join(diffDirectory, `${repository.replaceAll("/", "-")}.diff`), diff);
      if (branchHead(checkout, branch) !== base) {
        continue;
      }
      if (!changed) {
        return "unchanged";
      }
      console.log(`\n${repository}\n${diff}`);
      git(checkout, "add", "--", "README.md");
      if (git(checkout, "diff", "--cached", "--name-only") !== "README.md") {
        throw new Error("Refusing to commit files other than README.md");
      }
      const tree = git(checkout, "write-tree");
      const message = `${title}\n\nSource: jamiedavenport/jamiedavenport.me@${sourceCommit}\n`;
      if (!usePR) {
        const commit = checked(checkout, "git", ["commit-tree", tree, "-p", base], message);
        const pushed = command(checkout, "git", [
          ...gitOptions,
          "push",
          "--porcelain",
          "origin",
          `${commit}:refs/heads/${branch}`,
        ]);
        if (pushed.ok) {
          return "updated";
        }
        if (branchHead(checkout, branch) !== base) {
          continue;
        }
        if (!protectionRejection(pushed.error)) {
          throw new Error(
            `Push failed (not a branch-protection rejection): ${pushed.error}${pushed.output}`,
          );
        }
        usePR = true;
      }

      const previous = branchHead(checkout, syncBranch);
      const parents = ["-p", base];
      if (previous) {
        const fetched = fetchBranch(checkout, syncBranch);
        if (fetched !== previous) {
          continue;
        }
        const ancestor = git(checkout, "merge-base", base, previous);
        const paths = git(checkout, "diff", "--name-only", ancestor, previous);
        if (paths && paths !== "README.md") {
          throw new Error(`Reserved branch ${syncBranch} contains unrelated changes`);
        }
        assertOutsideUnchanged(
          checkedRaw(checkout, "git", ["show", `${ancestor}:README.md`]),
          checkedRaw(checkout, "git", ["show", `${previous}:README.md`]),
        );
        // First parent is latest destination: the commit changes only README.
        // Second parent retains PR history, so its update is a normal fast-forward.
        if (previous !== base) {
          parents.push("-p", previous);
        }
      }
      if (branchHead(checkout, branch) !== base) {
        continue;
      }
      // Avoid empty commits when retrying an existing, already current PR.
      const currentTree = previous ? git(checkout, "rev-parse", `${previous}^{tree}`) : "";
      if (tree !== currentTree) {
        const commit = checked(checkout, "git", ["commit-tree", tree, ...parents], message);
        const pushed = command(checkout, "git", [
          ...gitOptions,
          "push",
          "--porcelain",
          "origin",
          `${commit}:refs/heads/${syncBranch}`,
        ]);
        if (!pushed.ok) {
          if (branchHead(checkout, syncBranch) !== previous) {
            continue;
          }
          throw new Error(`Sync branch push failed: ${pushed.error}${pushed.output}`);
        }
      }
      if (branchHead(checkout, branch) !== base) {
        continue;
      }
      return pullRequest(checkout, repository, branch, sourceCommit);
    }
    throw new Error(
      `Destination kept advancing; exhausted ${maxAttempts} attempts. Retry manually.`,
    );
  } finally {
    rmSync(checkout, { recursive: true, force: true });
  }
}

function main() {
  const destinations: unknown = JSON.parse(process.env.DESTINATIONS ?? "[]");
  if (
    !Array.isArray(destinations) ||
    !destinations.length ||
    !destinations.every(
      (repo: unknown): repo is string =>
        typeof repo === "string" && /^jamiedavenport\/[a-zA-Z0-9_.-]+$/.test(repo),
    )
  ) {
    throw new Error("DESTINATIONS must be a nonempty JSON list of jamiedavenport repositories");
  }
  const diffDirectory = resolve(process.env.DIFF_DIRECTORY ?? join(tmpdir(), "readme-sync-diffs"));
  mkdirSync(diffDirectory, { recursive: true });
  const results: string[] = [];
  let failed = false;
  for (const repository of destinations) {
    let result: string;
    try {
      if (!process.env.GH_TOKEN) {
        throw new Error(
          "README_SYNC_TOKEN is missing; add it in this repository's Actions secrets (passed as GH_TOKEN)",
        );
      }
      const source = regularText(
        join(sourceDirectory, "readme-snippets", "more-by-jamie.md"),
      ).replaceAll("\r\n", "\n");
      if (!source.trim() || /<!--\s*md:include\b/i.test(source)) {
        throw new Error("Shared source must be nonempty and must not contain include markers");
      }
      const sourceCommit = git(sourceDirectory, "rev-parse", "HEAD");
      result = sync(repository, source, sourceCommit, diffDirectory);
    } catch (error) {
      failed = true;
      result = `failed: ${error instanceof Error ? error.message : String(error)}`;
    }
    // Also redact locally: do not rely solely on Actions' masking.
    const token = process.env.GH_TOKEN;
    const safeResult = token ? result.replaceAll(token, "[REDACTED]") : result;
    console.log(`${repository}: ${safeResult}`);
    results.push(
      `| ${repository} | ${safeResult.replaceAll("|", "\\|").replaceAll(/\r?\n/g, " ")} |`,
    );
  }
  const summary = `## README synchronization\n\n| Destination | Result |\n| --- | --- |\n${results.join("\n")}\n\nReview the readme-sync-diffs artifact and step logs.\n`;
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
  process.exitCode = failed ? 1 : 0;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
