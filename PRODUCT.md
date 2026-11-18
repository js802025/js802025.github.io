# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

<!-- inferred 2026-11-18, not yet confirmed by Jack -->
Two audiences, weighted equally: people evaluating Jack (recruiters, internship and research leads, GT peers) who skim for what he has shipped and how big it got; and people looking for one of his projects (Minecraft players after CalcMod, hosts after SideFlick, GT students after GTBus) who need a direct path to it.

## Product Purpose

Personal portfolio of Jack Adee (GitHub js802025), computer science student at Georgia Tech. It proves he ships real tools people use and routes visitors to each one. Success: a visitor can name his top projects and their reach within one screen, and reaches a project or his email in one click.

## Positioning

Not a résumé page: every project is shown working (a live /calc chat, a playable SideFlick timeline, a drawn Batcher scan) with live numbers pulled from Modrinth and GitHub.

## Capabilities and Constraints

- Static site on GitHub Pages: plain HTML/CSS/JS, no build step. `index.html` + `home.css` + `home.js`; `style.css`/`script.js` exist only for `cs2340.html`.
- Live data: Modrinth API (CalcMod downloads, followers, loaders, versions), GitHub API (repos, bio), jogruber contributions API, a gist for live activity status.
- Projects: CalcMod (Minecraft calculator mod, 3.5M+ Modrinth downloads, Fabric/Forge/NeoForge/Paper/Quilt), SideFlick (scene-synced movie trivia, sideflick.lol, Chrome extension), Skilldule AI (DegreeWorks-driven course planner), GTBus (gtbus.org live GT bus map), Batcher (OCR donation importer for nonprofits), CalcMod Updater (GitHub Action).
- Must respect `prefers-reduced-motion` and work without JS.

## Brand Commitments

- Copy is Jack's own first-person voice: terse, no over-explaining.
- Rejected before: Georgia Tech gold/navy as the palette ("basically just gatech"); opening on his quiet 2017–21 GitHub years.
- SideFlick appears in its own "Midnight Matinee" theme (tokens from sideflick-web/src/index.css), Bagel Fat One heading accepted.
- Confirmed 2026-11-18: keep the GitHub contributions graph, the live /calc chat, the SideFlick timeline demo and the Batcher slip drawing, but re-present them. The hero shows only the latest year's contributions; the multi-year pinned reel felt choppy and is out.
- Tech Tower photo closes the page with a pixel-to-photo resolve; Jack wants the effect kept, concept adjusted (2026-11-18).

## Evidence on Hand

Real screenshots in `images/web/` (CalcMod gallery shots, GTBus, Skilldule landing, SideFlick gameplay/extension/icon, Tech Tower photo by GT Facilities, portrait, GitHub avatar). Batcher has no good screenshot; it is a drawn illustration. No testimonials, press, or employer claims exist; do not invent them.

## Product Principles

1. Show the thing working before describing it.
2. Real numbers, fetched live, never rounded up.
3. Every project is one click from its live home.
4. Say less.
