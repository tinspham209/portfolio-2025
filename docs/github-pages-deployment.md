# Deploy a static site to GitHub Pages

This is the migration runbook used to move `tinspham.dev` from Vercel to GitHub
Pages. Apply the relevant parts to another repository; do not assume that its
account, domain, framework, or build output is identical.

## 1. Confirm the site can be published statically

- Identify the build command and output directory. This repository builds with
  `pnpm run build` and publishes `dist`.
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
      - main
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
      - run: pnpm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

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

Adapt `version`, `node-version`, install/build commands, and artifact path to the
target repository. Keep the deployment permissions and `github-pages`
environment unchanged.

## 3. Add the custom domain file

For this domain, `public/CNAME` contains:

```text
tinspham.dev
```

The static builder copies it to `dist/CNAME`. Verify this before enabling the
domain:

```bash
pnpm install --frozen-lockfile
pnpm run build
test "$(cat dist/CNAME)" = "tinspham.dev"
```

For another domain, replace `tinspham.dev` everywhere appropriate. Without a
custom domain, omit `CNAME`.

## 4. Validate locally

Run the smallest relevant checks:

```bash
pnpm run build
pnpm test -- --runInBand
git diff --check
```

Do not block a Pages migration on unrelated, pre-existing lint errors unless the
new workflow runs lint.

## 5. Commit and push

```bash
git add .github/workflows/deploy-pages.yml public/CNAME README.md
git commit -m "chore: deploy site with GitHub Pages"
git push origin main
```

The first Actions run is expected to build successfully but fail during deploy if
Pages has not been enabled yet.

## 6. Enable Pages with the repository owner's GitHub CLI profile

An SSH remote proves Git authentication, but does not prove that the active
`gh` profile owns the repository. Check both:

```bash
GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh auth status

GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh api repos/OWNER/REPOSITORY --jq '{permissions,visibility}'
```

The profile must report `admin: true`. Enable workflow-based Pages:

```bash
GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh api --method POST repos/OWNER/REPOSITORY/pages \
  -f build_type=workflow
```

If Pages already exists, update it instead:

```bash
GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh api --method PUT repos/OWNER/REPOSITORY/pages \
  -f build_type=workflow
```

Then rerun the failed workflow:

```bash
GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh run rerun RUN_ID --repo OWNER/REPOSITORY --failed
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
| CNAME | `www` | `OWNER.github.io` |

For this portfolio, the CNAME target is `tinspham209.github.io`.

Keep the apex A records at the registrar; do not use a URL forward or a
Vercel/CNAME target. Remove stale AAAA records pointing to the old host. Confirm
the public result against resolvers independent of the local network:

```bash
dig @1.1.1.1 +short DOMAIN A
dig @8.8.8.8 +short DOMAIN A
dig @1.1.1.1 +short www.DOMAIN CNAME
```

## 8. Attach the custom domain and enable HTTPS

Only after public DNS points to GitHub:

```bash
GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh api --method PUT repos/OWNER/REPOSITORY/pages \
  -f cname=DOMAIN
```

If the request reports that the certificate does not exist, do not force HTTPS
yet. Check Pages health until DNS is valid and HTTPS becomes eligible:

```bash
GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh api repos/OWNER/REPOSITORY/pages/health
```

Required health values are `is_valid: true` and
`is_pointed_to_github_pages_ip: true` for the apex, plus a valid `www` CNAME.
Once `responds_to_https: true`, enforce HTTPS:

```bash
GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh api --method PUT repos/OWNER/REPOSITORY/pages \
  -f cname=DOMAIN -F https_enforced=true
```

## 9. Final verification

```bash
curl -sSIL https://DOMAIN/ | head
curl -sSIL https://www.DOMAIN/ | head
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
dig +short DOMAIN A
dig @1.1.1.1 +short DOMAIN A
GH_CONFIG_DIR=/Users/tin.phamv/.config/gh-personal \
  gh api repos/OWNER/REPOSITORY/pages/health
```

If public resolvers show the four `185.199.*.153` addresses and Pages health is
valid, but the local resolver still returns a Vercel IP:

```bash
dscacheutil -flushcache
dig +short DOMAIN A
```

If macOS still uses its router-resolver cache, restart the affected network
interface, use another DNS resolver temporarily, or wait for the old local TTL
to expire. In Firefox, disable/reenable DNS over HTTPS or clear the DNS cache
through `about:networking#dns` if the browser keeps the old result independently.
Do not reconfigure Pages or revert the correct public DNS records to fix a cache.
