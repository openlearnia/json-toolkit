# json-toolkit

Privacy-first JSON utility for the browser. The app runs locally and does not send JSON data to any server.

## Features

- Paste JSON text directly into the input editor
- Load JSON from a local file (`.json` or text)
- Pretty format JSON
- Minify JSON
- Validate JSON with parser error details and line/column
- Copy output to clipboard

## Development

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
npm run preview
```

`npm run build` outputs production files to `dist/`.

## CI/CD

Pushes to `main` deploy `dist/` to Cloudflare Pages via GitHub Actions (`.github/workflows/deploy.yml`). You can also run the workflow manually from the Actions tab.

Required secrets: org-level `CF_API_TOKEN` and `CF_ACCOUNT_ID`, plus repo-level `CF_PAGES_JSON_TOOLKIT`.
