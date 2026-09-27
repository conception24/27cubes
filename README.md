# 27cubes

Ubongo 3D-inspired 3×3×3 cube puzzle prototype. The interface is designed for landscape play on phones, with touch-friendly piece rotation and placement.

## Run locally

Serve this directory with any static web server, then open `index.html` in a modern browser. No build step or dependencies are required.

## Deploy with Cloudflare Pages

Create a Pages project connected to this GitHub repository. Use the production branch `main`, leave the build command empty, and set the build output directory to `/` (repository root). Every push to `main` will then publish the static app.

## Notes

## v0.12.0 — early flexibility and live solution counts

v0.12.1: Random puzzles now always contain exactly three marked special pieces and three distinct unmarked original pieces, totaling 27 cubes. This composition also applies to the single-solution fallback. The central-core requirement, flexibility preference, and exact live counts remain unchanged.

- Random core puzzles fully enumerate solutions for up to 24 candidate sets (a time budget limits work on slower devices), then prefer the highest second-move flexibility. Piece-usage balancing and recent-set avoidance still apply before scoring.
- Flexibility measures the fraction of non-overlapping, floor-touching second placements that still admit a solution, after a completable floor-touching first placement. It is a puzzle-selection heuristic, not a promise that any two moves will work.
- The counter shows compatible solution classes / all solution classes. Whole-cube rotations, insertion order, and exchanges of identical unmarked pieces do not create extra solutions. Marked core positions are part of a solution. A class remains compatible if any of its 24 orientations matches every placed piece simultaneously.
- Enumeration and live filtering run in Web Workers. A timed-out search is never shown as an exact total; only fully enumerated random puzzles are accepted. Counts update on placement, return, hints, and puzzle changes.

- This is an independent prototype for testing original puzzle-piece arrangements; it is not affiliated with the Ubongo publisher.
- The puzzle-piece shapes and solve data are stored in `app.js` and `feasibility-worker.js`.

