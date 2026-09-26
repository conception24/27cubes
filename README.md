# 27cubes

Ubongo 3D-inspired 3×3×3 cube puzzle prototype. The interface is designed for landscape play on phones, with touch-friendly piece rotation and placement.

## Run locally

Serve this directory with any static web server, then open `index.html` in a modern browser. No build step or dependencies are required.

## Deploy with Cloudflare Pages

Create a Pages project connected to this GitHub repository. Use the production branch `main`, leave the build command empty, and set the build output directory to `/` (repository root). Every push to `main` will then publish the static app.

## Notes

- This is an independent prototype for testing original puzzle-piece arrangements; it is not affiliated with the Ubongo publisher.
- The puzzle-piece shapes and solve data are stored in `app.js` and `feasibility-worker.js`.

