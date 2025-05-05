# portfoli-oh

Legacy portfolio site and frontend experiment archive for Gabriel Jang. This repository is kept public as a visual record of the first portfolio system: project pages, custom interactions, language switching, and the lab pieces built while learning frontend fundamentals.

[Live site](https://portfoli-oh.oosu.dev) · [Frontend Lab](https://lab.oosu.dev)

![portfoli-oh project page](projectdetail/portfoliOh/portfoliocapture1.png)

## What This Shows

- Static portfolio information architecture with project detail pages, career pages, contact surfaces, and custom navigation.
- Interaction-heavy UI studies: custom cursor, scroll transitions, language switching, and a first AI-chat interface prototype.
- Frontend Lab experiments covering JavaScript canvas/DOM work and CSS-only motion studies.
- A useful before/after reference for the newer `oosu.dev` AI portfolio and RAG-backed project explorer.

## Visual Highlights

| Language switch | AI chat prototype |
| --- | --- |
| ![language switch demo](projectdetail/portfoliOh/portfolioLanguageChange.gif) | ![portfolio AI chatbot demo](projectdetail/portfoliOh/portfolioAiChatbot.gif) |

| JavaScript 3D blob | JavaScript Tetris | CSS solar eclipse | CSS airplane window |
| --- | --- | --- | --- |
| ![3D blob lab](lab/screenshot-automator/screenshots/js-3dBlob.jpg) | ![Tetris lab](lab/screenshot-automator/screenshots/js-Tetris.jpg) | ![solar eclipse CSS lab](lab/screenshot-automator/screenshots/css-036-solar-eclipse.jpg) | ![airplane window CSS lab](lab/screenshot-automator/screenshots/css-156-airplane-window-toggle.jpg) |

## Architecture

```text
portfoli-oh/
├── index.html                  # static entry point
├── common/                     # shared navigation, footer, styles, scripts
├── project/                    # project listing page
├── projectdetail/              # per-project detail pages and media assets
├── lab/
│   ├── lab.html                # original lab gallery entry
│   ├── javascript/             # JavaScript visual experiments
│   ├── pure-css/               # CSS-only visual experiments
│   └── screenshot-automator/   # captured lab thumbnails
└── api/chat.js                 # serverless-only prototype route using env vars
```

The site is intentionally simple: HTML, CSS, and vanilla JavaScript. That makes it easy to preserve as a portfolio artifact, while the newer `oosu.dev` site can own the current RAG/chat architecture.

## Security And Public Sharing Notes

- The public lab chat demo is now local-only. It does not ship provider API keys or call an external AI provider directly from the browser.
- Server-side AI calls must be routed through a backend/serverless endpoint that reads keys from environment variables.
- Any provider key that was previously committed or published from a browser bundle should be treated as exposed and revoked/rotated.
- Build artifacts, local editor settings, and private credentials should remain outside git.

## Running Locally

This is a static site. Open `index.html` directly in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
