# Nike Virtual Store — 1:1 clone

**The app that ships is the exact original store** (the mirrored build), NOT the rebuild.

## Run it
```bash
npm install
npm run dev      # -> http://localhost:5173  (the correct 1:1 store)
npm run build    # -> dist/  (what gets deployed)
```
Both `dev` and `build` build the app then overlay `mirror/` onto `dist/`, so what you
see locally is exactly what is deployed.

## Why
`mirror/` holds the original site's own pre-built bundle (`index.html` +
`assets/index-B9Sit61P.js` + `index-BrmWShTX.css`). `package.json` build is:
`vite build && cp -r mirror/. dist/` — the overlay replaces the built page with the original.

## The rebuild (kept, not deployed)
`src/` + `public/` contain our earlier hand-rebuilt approximation. It is NOT what
`dev`/`build` serve. It is kept only as a reference; to bring it back, remove the
`&& cp -r mirror/. dist/` overlay (and change `dev` back to `vite`).
