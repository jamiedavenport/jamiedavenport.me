// Published 2026-09-09: 115 offline pages, Apple M5 Max, Python 3.14.7.
// Median of five round medians; seconds rounded as in the published report.
// Dependencies count installed direct and transitive Python packages, excluding
// the tool itself. Native C/Rust code bundled in wheels is identified separately.
// https://github.com/jamiedavenport/htomd/blob/a1b386586388c57980141e340aabe362d89f2bd7/tools/benchmark/results/macos-arm64.md
// The htomd artifact was measured as 0.1.0 and released as 0.1.1.
export const performanceResults = [
  { name: "htomd", version: "0.1.0", seconds: 1.26, dependencies: 0, native: null },
  { name: "markdownify", version: "1.2.3", seconds: 2.443, dependencies: 4, native: null },
  { name: "html2text", version: "2025.4.15", seconds: 1.262, dependencies: 0, native: null },
  { name: "trafilatura", version: "2.2.0", seconds: 3.257, dependencies: 16, native: "C" },
  { name: "html-to-markdown", version: "3.12.2", seconds: 0.217, dependencies: 0, native: "Rust" },
  { name: "htmd-py", version: "0.1.2", seconds: 0.163, dependencies: 0, native: "Rust" },
] as const;
