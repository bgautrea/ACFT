# ACFT - Army Combat Fitness Test Calculator

Score calculator for the U.S. Army Combat Fitness Test. Static SPA, dark "Operations" theme, mobile-friendly.

A modernized rewrite of [Joseph Fusco's APFT](https://github.com/josephfusco/APFT) progressive web app.

## Development

Requires Node 22+.

```bash
npm install
npm run dev        # start dev server
npm test           # run unit + integration tests
npm run typecheck  # TypeScript-only check
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## Deploy

Container build (multi-stage, nginx-served):

```bash
docker build -t acft .
docker run --rm -p 8080:8080 acft
```

Image on [Dockerhub](https://hub.docker.com/repository/docker/bgautrea/acft/general).

## Stack

Vite 5 / React 19 / TypeScript / Tailwind v4 / Vitest. PWA via `vite-plugin-pwa`.
