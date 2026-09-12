# htomd port benchmark

Measured on 12 September 2026 using htomd 0.1.1 on an Apple M5 Max. The chart
reads its summary from `results.json`, which also retains raw pass totals,
output hashes, toolchain versions and source provenance. The one-off measurement
harness has been removed; its recorded hashes identify the scripts used at the time.

The run used htomd's local Python package, freshly compiled TypeScript on Node,
and Go and release-mode Rust workers compiled against the local libraries.
All 115 corpus files and hashes match those used in the original Python benchmark.

## Method

- Use all 115 saved HTML pages from htomd's corpus, sorted by ID. Verify each raw
  file's SHA-256 against the corpus manifest, then decode its declared encoding.
  Every worker receives the same decoded strings via a temporary JSON file.
- Run five rounds, with a fresh process for each language. Shuffle language order
  within each round using seed `20260912`. Workers run sequentially.
- Load inputs and import the library before timing. Run one complete warm-up pass,
  then at least five measured passes and at least two seconds of timed work.
- Time each public `convert` call using a monotonic clock, with default options
  and no source URL. Sum the document times for a corpus pass. One caller converts
  one page at a time; runtime garbage collection and thread settings remain at
  their defaults. No CLI invocation, file I/O, compilation or process startup is
  included in the measured interval.
- Keep warm-up outputs in memory. Check subsequent outputs for exact equality
  outside timing. Rust also passes its input through `black_box`. Validation,
  hashing and result serialisation are outside timing. Garbage collection that
  occurs inside a conversion remains included.
- Report the median of the five process medians. The range is the minimum and
  maximum process median, not a confidence interval. Raw pass totals are retained
  in nanoseconds. Compare UTF-8 output hashes against Python across all pages and
  check consistency between processes.
- Record toolchain versions, package versions, checkout revision and dirty state,
  runtime source hashes, worker hashes and corpus hashes. Fail if library source
  files change during the run. A dirty checkout is permitted; the recorded file
  hashes identify the measured source.

These are measurements of the current implementations on one corpus and machine,
not a general language ranking. Small differences with overlapping ranges do not
establish a winner. Matching outputs do not establish extraction quality.

The saved HTML remains in htomd's repository with its existing provenance and
licences. This directory contains hashes and measurements, not copies of those
pages.
