# GitHub Pages preparation

The production base is `/tieto-bid-projects/`; `npm run dev` still serves from `/`. The application uses HashRouter so routes and query parameters are inside the fragment and require no server rewrites.

Example published routes:

- `https://<owner>.github.io/tieto-bid-projects/#/customers`
- `https://<owner>.github.io/tieto-bid-projects/#/bids`
- `https://<owner>.github.io/tieto-bid-projects/#/bids/new?customerId=1`
- `https://<owner>.github.io/tieto-bid-projects/#/customers?customerId=1`

Use hash URLs for direct navigation and refresh. Old history-style `/tieto-bid-projects/bids` URLs are not supported by GitHub Pages. Customer/bid query parameters continue to be managed by React Router.

Public assets use `import.meta.env.BASE_URL` where referenced from runtime JSX. Both official logo SVG files are copied into `dist/branding/`; the sidebar uses the white logo with its existing proportions. Use `${import.meta.env.BASE_URL}branding/tieto_logo_blue_rgb.svg` for a future light-background logo placement. The Vite HTML entry and imported CSS/JS assets are rewritten during the build.

## Local verification

Use Node.js 22, then run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. Preview the production build with `npm run preview` and open `http://localhost:4173/tieto-bid-projects/#/customers` or `#/bids`. Development uses `http://localhost:5173/#/customers`. After building, `node tests/pages-build.mjs` verifies the development/production base configuration and requests the built entry URLs, JS/CSS and both logos from a temporary localhost preview server.

## Remaining GitHub setup (not performed)

1. Create the `tieto-bid-projects` repository under the intended owner and add this project's files, including `package-lock.json`, the workflow and `public/branding/`.
2. Enable GitHub Actions and allow the workflow's requested actions and token permissions under repository/organization policies.
3. Under Settings → Pages → Build and deployment, choose GitHub Actions as the source. Ensure Pages is available for the repository visibility/account plan.
4. Ensure the `github-pages` environment permits deployments from `main`; satisfy any configured required reviewers.
5. When deployment is intended, push to `main` or manually run the workflow. Either action can deploy; neither was performed during preparation.

No repository or owner-specific secrets are required for this Pages workflow. Local `.env` and `.env.*` files are ignored except `.env.example`, which must contain placeholders only. Frontend Vite environment values are public in the built site; do not put credentials there. `node_modules` and `dist` remain ignored.

Mock customer/bid changes still reset on refresh; hosting does not add a backend or persistence.

References: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [React Router HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

