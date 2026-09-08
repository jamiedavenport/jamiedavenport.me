# Shared README section

Edit [readme-snippets/more-by-jamie.md](../readme-snippets/more-by-jamie.md) by hand.
It is independent of website data. Every destination gets all three entries,
including its own link; there is no project-specific filtering.

[Sync READMEs](../.github/workflows/sync-readmes.yml) checks out the latest source
`main` with this repository's read-only `GITHUB_TOKEN`. The Bun script checks out
each destination's latest default branch into a separate temporary directory.
Only the root `README.md` can be committed. Each commit has the subject
`docs: sync more by Jamie` and records the source commit in its body.

## Destination preparation

Read-only validation on 2026-09-08 found **Sidequest prepared and
unchanged** on remote `main`. Its separately prepared change reached GitHub
during setup. **Capd and PolicyStack still lack the block on their default
branch (`main`)** and need the manual preparation below. No destination was
changed during setup.

In each destination's root `README.md`, add this exact block once, separated from
surrounding prose by blank lines. Replace any existing hand-maintained "More by
Jamie" section instead of duplicating it. Commit and publish the preparation
through that repository's normal process; this synchronizer will not add markers.

```markdown
<!-- Edit the shared source in jamiedavenport/jamiedavenport.me: readme-snippets/more-by-jamie.md. -->
<!-- md:include start path="more-by-jamie.md" required=true -->

## More by Jamie

| Name        | Description                                                           | Website                                    | Repo                                                    |
| ----------- | --------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| PolicyStack | Privacy policies and cookie consent driven by the same configuration. | [policystack.dev](https://policystack.dev) | [GitHub](https://github.com/jamiedavenport/policystack) |
| Sidequest   | A personal task manager designed with ADHD in mind.                   | [sdqst.app](https://sdqst.app)             | [GitHub](https://github.com/jamiedavenport/sidequest)   |
| Capd        | A private Mac app for saving and finding links, notes, and images.    | [capd.jxd.dev](https://capd.jxd.dev)       | [GitHub](https://github.com/jamiedavenport/capd)        |

<!-- md:include end -->
```

Markers must be on their own lines, with the source comment immediately before
the start marker. The current contract allows exactly one `md:include` pair in
the README. Missing, duplicate, nested, reversed, or malformed markers fail that
destination and leave it untouched. The remaining destinations still run; any
failure makes the whole run fail.

## Authentication and activation

1. Create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new)
   owned by `jamiedavenport`. Select **Only select repositories** and select
   `sidequest`, `capd`, and `policystack`. Grant **Contents: Read and write** and
   **Pull requests: Read and write**; metadata read access is automatic. Choose
   an expiration and set a renewal reminder. Do not grant branch-rule bypass.
2. In [this repository's Actions secrets](https://github.com/jamiedavenport/jamiedavenport.me/settings/secrets/actions),
   create the repository secret **`README_SYNC_TOKEN`**. Enter the token there,
   never in source files, commands saved to shell history, logs, or chat.
   Public visibility does not give this repository's `GITHUB_TOKEN` write access
   to other repositories.
3. Publish this setup to source `main` and publish all destination marker blocks.
   Ensure GitHub Actions and the workflow's referenced actions are allowed in
   this repository's Actions settings. Relevant pushes to `main` synchronize
   automatically; no activation variable is required.
4. For a manual retry, select **Actions → Sync READMEs → Run workflow → main**.
   Every run applies changes; there is no dry-run mode. Inspect the
   per-destination Actions summary, step-log diffs, and downloadable
   **readme-sync-diffs** artifact. Prepared destinations already matching the
   snippet will report `unchanged`.

At setup time, the `README_SYNC_TOKEN` secret already exists; its value and
permissions cannot be inspected through the secrets listing. Confirm its scope
and expiry rather than creating a duplicate. Local read-only validation used
the existing GitHub CLI login; Actions uses the configured secret.

Renew by creating a replacement token with the same repository selection and
permissions, replacing the `README_SYNC_TOKEN` secret, running the workflow, and
revoking the old token after success. An unchanged destination verifies reads
but cannot prove write permission. Expired/revoked tokens,
permission failures, and network errors fail normally; they are not treated as
branch protection. See GitHub's [token management guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

## Runs, retries, and pull requests

Pushes to `main` affecting the snippet, orchestration script, workflow, or mise
tool versions trigger automatic synchronization. Manual dispatches
must select `main`; other refs are skipped. Both manual runs and retries read
the latest source `main`, even when rerunning an older event. Runs share one
concurrency group and do not cancel an active run; GitHub may replace an older
pending run with a newer one.

Artifacts contain the last generated diff for each processed
destination; consult its result to see whether publication succeeded.

Writes use normal Git pushes. If the destination advances, the script fetches
it and regenerates, preserving changes outside the managed section. After three
attempts it fails clearly; retry through **Run workflow** after resolving the
reported issue. Other
destinations can succeed despite an individual failure. Successful destinations
are normally unchanged on the next run, so partial failures are safe to retry.

An explicit GitHub `GH006` protected-branch or `GH013` repository-rule rejection
switches that destination to a PR. The reserved branch
**`docs/sync-more-by-jamie`** is reused, with at most one open sync PR against the
default branch. Do not use this branch for unrelated work. Existing unrelated
changes on it cause a failure. PR updates retain the old branch tip as a second
parent and use the latest destination as first parent: normal pushes preserve
history, and the resulting diff against the destination contains only the README
section. There are no force pushes or empty commits. An already current PR
branch needs no new commit; its PR description is refreshed. If rules also
prevent writing the sync branch, the destination fails for manual attention.

Review and merge sync PRs through the destination's normal branch rules. The
workflow does not merge PRs or bypass required checks. If the default branch is
already current, it reports `unchanged`; it does not close old PRs automatically.
Destination CI runs normally with PAT-authored pushes and PRs. In particular,
[Sidequest's CI](https://github.com/jamiedavenport/sidequest/blob/main/.github/workflows/ci.yml)
currently deploys on pushes to `main`, including README synchronization commits
and merged sync PRs.

To pause synchronization, disable the workflow in Actions. Enable it again when
ready to resume, then run it manually to catch up.

## Adding a destination

Prepare its root README with the exact block above, publish it to its default
branch, add the repository to the token's selection, and add its full name to
the single **`DESTINATIONS`** JSON list in the workflow. The script accepts
repositories owned by `jamiedavenport`; changing owners requires an intentional
script and authentication change. Validate the marker block before publishing
the workflow list change, which triggers synchronization immediately.

## Weaver and formatting

The workflow installs **`readme-weaver==0.1.1` with Python 3.13**. Its installed
single-command Typer CLI was verified as:

```sh
readme-weaver --base-dir /absolute/path/to/source/readme-snippets README.md
```

There is no `run` subcommand and no `--all-files` flag in this invocation. The
published package scans other Markdown even when a positional filename is
given, so the script invokes it in a temporary directory containing only the
destination README. The base directory always points to the source repository's
`readme-snippets`, not to a destination file.

Weaver 0.1.1 inserts an auto-generated comment directly before source content.
The wrapper verifies that exact output, removes the redundant notice (the
required source comment already explains editing), and adds one blank line
between each marker and the rendered content. It preserves LF or CRLF endings
and all bytes outside the managed section, rejects unexpected tool output, and
requires nonempty source content. The insertion itself is performed by Weaver.
Recheck these assumptions and verify formatting in temporary fixtures when upgrading the pinned
package. Do not run a formatter over entire destination READMEs in this workflow.

Documentation checked during implementation: Context7
`/websites/github_en_actions` (unversioned), `/actions/checkout/v5` (v5), and
`/jdx/mise-action` (v3 requested; unversioned index). Context7 had no Readme Weaver
entry; [PyPI 0.1.1](https://pypi.org/project/readme-weaver/0.1.1/), the installed CLI
and package source were checked directly. PR updates use Git's documented
[`commit-tree` parent support](https://git-scm.com/docs/git-commit-tree).
