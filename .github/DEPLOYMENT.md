# Production: oblachko.team on Netlify

Production is the locked Netlify deploy, not an automatic GitHub Pages build.
Read [PRODUCTION_SAFETY.md](PRODUCTION_SAFETY.md) before any release or rollback.

## Current stable recovery point

- Production code snapshot: `ca5519d15904b4f1e6013640f6595efb2b091413`.
- Immutable Git tag: `production-stable-2026-10-27`.
- Netlify site: `52c17cb7-547f-4ffb-9bc2-b50e3cbb150c`.
- Stable Netlify deploy: `6ae03c41cb1832ed5a9d21e2`.
- Backup branch: `backup/pre-vercel-migration-2026-10-27`.

Netlify has no linked Git repository, build hooks, or branch deploys. The current
production deploy is locked. A push or merge into this repository does not publish
to Netlify. GitHub Pages remains a legacy copy/redirect and is not the production
release mechanism. Do not restore old main-site versions or force-push to deploy.

## Controlled release

1. Start from the current approved static production artifact. Preserve the
   homepage, photos, navigation and ordinary pages outside the requested scope.
2. Use a release branch and updated `.github/release-intent.json`. The protected
   main branch requires a PR and the existing `Release guard`; never bypass it.
3. Upload only the reviewed static artifact as a private Netlify draft preview
   (`--draft --no-build`). Check the diff, homepage, all 30 partner routes, QR,
   bonus screens and Metrika partner IDs. A local Next.js build is not automatically
   the approved replacement for the current main site.
4. Get explicit owner approval of the exact preview/deploy ID, deliberately publish
   that selected artifact in Netlify, and immediately lock it again.
5. Verify production HTTPS, homepage, partner pages, old QR and analytics. Keep the
   previous stable deploy and snapshot until the replacement passes.

## Rollback

Publish a known-good existing Netlify deploy, lock it and smoke-test. If Netlify
retention has removed the old deploy, use the stable tag/frozen snapshot through
the same preview and approval process. Do not reset or force-push main, deploy an
entire older main site for a partner-only fix, or return DNS to GitHub automatically:
the old GitHub custom-domain certificate expired.

Historical deployment documents stored in older Git tags describe the old host;
use this current policy when recovering their static files.
