# PrivateClient interface preview

An interactive redesign based on static inspection of the supplied PrivateClient 2.0.0 Fabric JAR. It includes module filtering and keybind previews, a draggable HUD editor, appearance controls, and simulated Spotify playback. Changes are saved locally in the browser.

This is a web prototype, not a modified Minecraft mod. It does not connect to Spotify or apply changes to the original JAR. The actual source project is needed to integrate and build the redesign.

## Run

```sh
npm install
npm run dev
```

Use `npm run build` for a production build. Open **Build notes** in the preview, or read `public/CLIENT_PORT.md`, for the archive findings and porting instructions. Renderer-independent Java utilities, tests, and a licensed Inter TTF are in `client-port/` and downloadable from the preview.

For browser smoke checks, start the dev server, install Playwright's Chromium if needed (`npx playwright install --with-deps chromium`), then run `node tests/preview-smoke.mjs`. Set `PREVIEW_URL` if the server is not at `http://localhost:5173`.