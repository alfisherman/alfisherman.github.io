# Production: oblachko.team

GitHub Pages publishes the root of `main` in `alfisherman/alfisherman.github.io`.
That commit, not a local Next.js working tree or `out/`, is the production source of truth.
`053aff92f0f2a023d0a4b4e4fc3e397af9a71bca` is the verified restored site and rollback point.

## Release

1. Fetch `origin/main` and create a new branch or worktree from it. Work on experiments in another branch/worktree.
2. For a partner task, copy **only** reviewed files below `p/` from a build artifact into the release branch. Never copy all of `out/`. A partner PR cannot modify `index.html`, site assets, CNAME, or any other path.
3. For a site-wide change, deliberately choose `site` scope. Review the complete static diff, including images and homepage HTML. Compute `shasum -a 256 index.html` after preparing the branch.
4. Update `.github/release-intent.json` in the release branch. Set `base` to the exact current `origin/main` SHA, `scope` to `partners`, `site`, or `infra`, and give a reason. For `site`, set `homepageSha256` to the reviewed `index.html` hash.
5. Push the release branch, open a PR against `main`, inspect its **Files changed**, wait for `Release guard`, and merge intentionally. Only a merge to protected `main` publishes. Do not force-push.
6. Check the Pages deployment and the live domain after merge.

Example intent for a partner-only release:

```json
{
  "base": "<full 40-character SHA of origin/main>",
  "scope": "partners",
  "reason": "Publish reviewed partner pages for the October campaign"
}
```

The guard rejects a stale base, absent or unchanged intent, partner changes outside `p/`, and a site-wide release whose homepage hash differs from the declared one. Its workflow runs from protected `main` and does not execute proposed PR code.

## Rollback

Create a new branch from current `origin/main`. Restore the desired files from the last known-good commit (`053aff9` for the recovered site), set `scope: site` and the restored homepage hash in release intent, then open and merge a PR. This preserves history and avoids force-pushing. For one bad release, `git revert <release-commit>` on the new branch is also possible; review the resulting diff.
