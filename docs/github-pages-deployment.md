# GitHub Pages migration runbook

This is an executable handoff document for an agent working in another
repository. Copy this file into that repository, open a new session, and use the
prompt below. The agent must discover values from the repository and connected
accounts before asking for input.

## Prompt for a new session

> Execute `docs/github-pages-deployment.md` end to end. Migrate this repository
> from Vercel to GitHub Pages with GitHub Actions and preserve the custom domain
> where possible. Auto-discover the GitHub owner/repository, package manager,
> build command, output directory, default branch, GitHub account/profile, and
> domain from local files and connected services. Do not ask me for a value that
> can be discovered. Make code/config changes, validate them, enable Pages, deploy,
> and prepare exact DNS changes. Ask only for an unavailable owner login or the
> exact manual DNS update when it cannot be performed with the connected tools.
> Keep Vercel running until the Pages deployment and HTTPS are healthy unless I
> explicitly say it is unavailable.

## Agent operating rules

1. Treat `OWNER`, `REPOSITORY`, `DOMAIN`, `BUILD_COMMAND`, and `OUTPUT_DIR` as
   discovered variables, never values to copy blindly from this portfolio.
2. Inspect before editing. Preserve unrelated worktree changes.
3. Prefer local repository files, `git`, and `gh`; do not browse for an answer
   that can be derived locally.
4. Never print tokens, credentials, browser session data, or personal Git
   configuration files in logs or documentation.
5. Continue through reversible work. Ask only when the next required value or
   action is genuinely unavailable: owner authentication, manual DNS access, or
   a domain that cannot be inferred.
6. A migration is complete only when the workflow succeeds, the custom domain
   serves the new build over HTTPS, `www` redirects correctly if used, and all
   repository changes are pushed.

## 0. Preflight and variable discovery

Run these checks before changing files:

```bash
git status --short
git remote -v
git branch --show-current
git ls-files
gh auth status
gh repo view --json name,owner,defaultBranchRef
```

Derive the deployment variables from local configuration rather than prompting:

```bash
REPOSITORY="$(gh repo view --json name -q .name)"
OWNER="$(gh repo view --json owner -q .owner.login)"
DEFAULT_BRANCH="$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)"
```

The active `gh` account must report `admin: true`:

```bash
gh api "repos/$OWNER/$REPOSITORY" --jq '{permissions,visibility}'
```

If it does not, inspect the available local `gh` profiles and select one that
authenticates the repository owner. For this user's machine, the known profile
directory is `/Users/tin.phamv/.config/gh-personal`; export it only if that
directory exists and authenticates the correct owner:

```bash
export GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal
```

Otherwise, use the active profile or ask the user to authenticate the owner.
Never read, print, or commit token files.

Inspect deployment and framework metadata:

```bash
ls -la
find . -maxdepth 2 -type f \
  \( -name package.json -o -name 'vercel.json' -o -name 'vite.config.*' \
  -o -name 'next.config.*' -o -name 'rsbuild.config.*' \
  -o -name 'astro.config.*' -o -name CNAME -o -name netlify.toml \)
```

Discover the package manager, install/build commands, output directory, default
branch, and domain. Domain candidates are `vercel.json`, canonical/OG URLs,
`CNAME`, sitemap, robots, repository homepage, and the connected Vercel project.
If the app is not static or uses server-side functions, stop and explain the
unsupported runtime requirement instead of producing a broken migration.

## 1. Confirm the site can be published statically

- Identify `BUILD_COMMAND` and `OUTPUT_DIR`; do not assume `pnpm`, Node 22, or
  `dist`. This runbook's original repository used `pnpm run build` and `dist`.
- The output must contain a real `index.html`, all runtime assets, and a custom
  domain file if an apex domain will be used.
- This site uses root-relative assets such as `/images/...` and `/models/...`.
  That is suitable with an apex custom domain. A project Pages URL such as
  `https://USER.github.io/REPOSITORY/` would require a matching build `publicPath`
  instead.
- For a private dependency or Git LFS deployment, enable the required checkout
  options in the workflow. Verify that large/model files are present in the
  generated artifact, not only represented by LFS pointers.

## 2. Add the deployment workflow

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main # Replace with $DEFAULT_BRANCH before use.
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm run build # Replace with $BUILD_COMMAND before use.

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist # Replace with $OUTPUT_DIR before use.

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

Adapt every environment-specific value from preflight. Use the lockfile to
select `pnpm`, `npm`, Yarn, or Bun, use the repository's declared runtime/package
manager version, and set `BUILD_COMMAND` and `OUTPUT_DIR` from its actual config.
Keep the Pages permissions, `id-token`, artifact action, and `github-pages`
environment unchanged.

## 3. Add the custom domain file

If a custom domain was discovered, ensure the static asset directory contains a
plain `CNAME` file. The original reference repository used:

```text
tinspham.dev
```

Adapt the path to the framework and verify the value reached `OUTPUT_DIR`:

```bash
$BUILD_COMMAND
test "$(cat "$OUTPUT_DIR/CNAME")" = "$DOMAIN"
```

For another domain, write the discovered apex domain, without a protocol or
trailing slash. Without a custom domain, omit `CNAME`.

## 4. Validate locally

Run the repository's existing build and relevant checks:

```bash
$BUILD_COMMAND
git diff --check
```

Also run existing tests and type checks when configured. Do not block the
migration on unrelated pre-existing lint errors unless the new workflow runs lint.

## 5. Commit and push

```bash
git add .github/workflows/deploy-pages.yml
test -f public/CNAME && git add public/CNAME || true
git commit -m "chore: deploy site with GitHub Pages"
git push origin "$DEFAULT_BRANCH"
```

The first Actions run is expected to build successfully. It may fail during
deploy if Pages is not enabled; rerun the failed job after enabling Pages.

## 6. Enable Pages with the repository owner's GitHub CLI profile

An SSH remote proves Git authentication, but does not prove that the active
`gh` profile owns the repository. Use the profile discovered during preflight:

```bash
gh auth status
gh api "repos/$OWNER/$REPOSITORY" --jq '{permissions,visibility}'
```

The profile must report `admin: true`. Enable workflow-based Pages:

```bash
gh api --method POST "repos/$OWNER/$REPOSITORY/pages" \
  -f build_type=workflow
```

If Pages already exists, update it instead:

```bash
gh api --method PUT "repos/$OWNER/$REPOSITORY/pages" \
  -f build_type=workflow
```

Then rerun the failed workflow:

```bash
gh run rerun "$RUN_ID" --repo "$OWNER/$REPOSITORY" --failed
```

The deployed project URL should respond with `200` before DNS is changed.

## 7. Configure DNS at the domain registrar

For an apex domain on GitHub Pages, remove obsolete hosting records and add all
four A records:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `$OWNER.github.io` |

For this portfolio, the CNAME target is `tinspham209.github.io`.

Keep the apex A records at the registrar; do not use a URL forward or a
Vercel/CNAME target. Remove stale AAAA records pointing to the old host. Confirm
the public result against resolvers independent of the local network:

```bash
dig @1.1.1.1 +short "$DOMAIN" A
dig @8.8.8.8 +short "$DOMAIN" A
dig @1.1.1.1 +short "www.$DOMAIN" CNAME
```

## 8. Attach the custom domain and enable HTTPS

Only after public DNS points to GitHub:

```bash
gh api --method PUT "repos/$OWNER/$REPOSITORY/pages" \
  -f cname="$DOMAIN"
```

If the request reports that the certificate does not exist, do not force HTTPS
yet. Check Pages health until DNS is valid and HTTPS becomes eligible:

```bash
gh api "repos/$OWNER/$REPOSITORY/pages/health"
```

Required health values are `is_valid: true` and
`is_pointed_to_github_pages_ip: true` for the apex, plus a valid `www` CNAME.
Once `responds_to_https: true`, enforce HTTPS:

```bash
gh api --method PUT "repos/$OWNER/$REPOSITORY/pages" \
  -f cname="$DOMAIN" -F https_enforced=true
```

## 9. Final verification

```bash
curl -sSIL "https://$DOMAIN/" | head
curl -sSIL "https://www.$DOMAIN/" | head
```

Expected:

- Apex returns `200` with `server: GitHub.com`.
- `www` returns a `301` to the apex.
- The page title/content comes from the new build.
- The latest Actions run is `completed` and `success`.

## Troubleshooting stale Vercel responses

`404 DEPLOYMENT_NOT_FOUND`, `402 DEPLOYMENT_DISABLED`, `server: Vercel`, or
`x-vercel-error` mean the request still reaches Vercel. That is a DNS/cache
problem, not a Pages deployment failure.

Check three sources:

```bash
dig +short "$DOMAIN" A
dig @1.1.1.1 +short "$DOMAIN" A
gh api "repos/$OWNER/$REPOSITORY/pages/health"
```

If public resolvers show the four `185.199.*.153` addresses and Pages health is
valid, but the local resolver still returns a Vercel IP:

```bash
dscacheutil -flushcache
dig +short "$DOMAIN" A
```

If macOS still uses its router-resolver cache, restart the affected network
interface, use another DNS resolver temporarily, or wait for the old local TTL
to expire. In Firefox, disable/reenable DNS over HTTPS or clear the DNS cache
through `about:networking#dns` if the browser keeps the old result independently.
Do not reconfigure Pages or revert the correct public DNS records to fix a cache.

## Rollback and safe cutover

- Before DNS cutover, verify the new project Pages URL returns `200` and its
  assets are loadable.
- Keep the old hosting record unchanged until GitHub Pages is healthy unless the
  old deployment is already unavailable.
- Record the old apex and `www` DNS values before editing. If Pages fails after
  cutover, restore those values and retain the workflow commit; this rolls back
  traffic without destroying the migration.
- After success, remove the Vercel domain assignment only if desired. Do not
  delete Vercel deployment resources until the DNS TTL has elapsed.

## Completion report

The agent must finish with:

- commit SHA and pushed branch;
- GitHub Actions run ID, status, and URL;
- Pages project URL and custom domain;
- DNS records actually configured;
- HTTPS and Pages-health status;
- any remaining cache propagation item and its exact verification command;
- path to this runbook and the next-session prompt above.
