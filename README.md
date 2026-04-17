# Job Counter

A self-refreshing visual counter that shows how many active job listings exist in Australia for a given role. Embeds into WordPress (or any site) with a single `<script>` tag.

- **Data source**: [Adzuna Australia API](https://developer.adzuna.com/) — aggregates major AU job boards. Free tier = 250 calls/month.
- **Refresh**: GitHub Actions cron runs every 48 hours, commits an updated JSON blob.
- **Delivery**: JSON + widget are served from GitHub Pages (free CDN, CORS enabled).
- **Cost**: $0.

## Quick start

### 1. Get Adzuna API keys

Register at https://developer.adzuna.com/ and grab your `app_id` and `app_key`.

### 2. Push this repo to GitHub

```bash
cd job-counter
git init
git add .
git commit -m "initial"
git branch -M main
git remote add origin https://github.com/<YOUR-USER>/job-counter.git
git push -u origin main
```

### 3. Add Adzuna credentials as GitHub Secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`

### 4. Enable GitHub Pages

Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: `main` / root → Save.

Your assets will be at:
- Widget: `https://<YOUR-USER>.github.io/job-counter/widget/counter.js`
- Data:   `https://<YOUR-USER>.github.io/job-counter/data/<id>.json`

### 5. Run the workflow once manually

Repo → Actions → **Refresh job counts** → Run workflow. This fetches real counts and commits them to `data/`.

### 6. Embed in WordPress

In any page/post, add a **Custom HTML** block and paste:

```html
<script src="https://<YOUR-USER>.github.io/job-counter/widget/counter.js" defer></script>
<div data-job-counter="whs"></div>
```

That's it. The widget auto-mounts, animates from 0 to the current count, and shows when the data was last refreshed.

## Adding more roles

Edit [`config/roles.json`](config/roles.json):

```json
[
  { "id": "whs",     "query": "work health and safety", "label": "Work Health & Safety" },
  { "id": "nursing", "query": "registered nurse",       "label": "Registered Nurse" }
]
```

- `id`: kebab-case identifier used in the embed (`data-job-counter="nursing"`) and filename (`data/nursing.json`).
- `query`: the search string sent to Adzuna.
- `label`: the display name shown on the card.

Commit the change. The next scheduled run (or a manual trigger) will create `data/<id>.json`. Embed anywhere with:

```html
<div data-job-counter="nursing"></div>
```

## Local development

```bash
# Install nothing — it's zero-dep. Just need Node 20+.

# Fetch real data locally (optional)
export ADZUNA_APP_ID=xxxx
export ADZUNA_APP_KEY=xxxxxxxxxxxx
node scripts/fetch-count.mjs

# Preview the widget
npx serve .          # or: python3 -m http.server 8080
# then open http://localhost:3000/widget/demo.html
```

Note: open `demo.html` via a local web server, not `file://` — browsers block `fetch()` on `file://` URLs.

## Project layout

```
job-counter/
├── .github/workflows/refresh.yml   # cron every 48h + manual trigger
├── scripts/fetch-count.mjs         # Adzuna → data/*.json
├── config/roles.json               # roles to track
├── data/                           # committed JSON output (served by GH Pages)
├── widget/
│   ├── counter.js                  # vanilla JS widget (no deps)
│   └── demo.html                   # local preview
├── package.json
└── README.md
```

## How it looks

The card uses a navy→indigo→violet gradient with a gold accent on the number, a pulsing "live" dot, a briefcase badge, and a watermark silhouette of Australia. Fully responsive, self-contained CSS (prefixed `.jc-`) so it won't conflict with your WordPress theme.

## Notes

- **Count accuracy**: Adzuna aggregates most major AU boards but isn't exhaustive. Good for a "vibes" counter — and avoids double-counting cross-posted roles.
- **Rate limits**: 250 Adzuna calls/month free tier. At 1 call per role per refresh × 15 refreshes/month, you can track ~15 roles comfortably.
- **Failure mode**: If Adzuna is unreachable during a refresh, the previous JSON stays in place and the widget keeps showing the last known count. The Action shows red and emails you.
- **Caching**: GitHub Pages caches aggressively; the widget appends a per-hour cache-bust param so fresh data is picked up within an hour of refresh.
