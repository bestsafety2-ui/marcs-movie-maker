# Marc's Magic Movie Maker — Deploy Guide

A dual-chamber video studio (Cinema + NSFW) wired to the Atlas Cloud API via Netlify Functions.

## Project structure

```
mmmm-project/
├── index.html                          ← the app
├── netlify.toml                        ← Netlify config
└── netlify/
    └── functions/
        ├── upload-image.js             ← uploads source image to Atlas
        ├── generate-video.js           ← submits generation
        └── check-status.js             ← polls for result
```

## Deploy in 6 steps

### 1. Get your Atlas Cloud API key
- Go to https://www.atlascloud.ai
- Sign up / log in
- Dashboard → API Keys → create new key
- Copy it somewhere safe

### 2. Add billing credits
- Atlas Cloud is pay-as-you-go. Add at least $5–10 to start testing.
- Each generation costs ~$0.05–$0.50 depending on model + duration.

### 3. Get the project onto GitHub
Two options:

**Option A — Use your existing repo workflow** (you already have a Magic MARCeting Netlify repo)
- Drop these files into a new repo or new folder.

**Option B — Manual upload to Netlify**
- Skip GitHub entirely. Go to Netlify dashboard → Add new site → Deploy manually → drag the `mmmm-project` folder onto the page.

### 4. Connect to Netlify
- Netlify dashboard → Add new site → Import from Git (or drag-and-drop)
- Build settings should auto-detect from `netlify.toml`:
  - Publish directory: `.`
  - Functions directory: `netlify/functions`
- Deploy.

### 5. Add your API key as an environment variable
**CRITICAL** — this is what keeps your key secret.
- Site dashboard → Site configuration → Environment variables
- Add new variable:
  - Key: `ATLASCLOUD_API_KEY`
  - Value: *paste your Atlas Cloud key*
- Save.
- Trigger a redeploy (Deploys tab → Trigger deploy → Deploy site).

### 6. Test it
- Open your Netlify site URL
- Cinema Creator → pick "Seedance 2.0 Fast" (cheapest cinema option, ~$0.022/sec)
- Upload any image, write a prompt, hit RUN
- Watch the status line — upload → submit → polling → done
- The video will play inline and you can download the MP4

## Troubleshooting

**"ATLASCLOUD_API_KEY not set"**
- You forgot step 5 or didn't redeploy after adding the variable.

**"Submit failed (404)" or "Model not found"**
- The model identifier in the HTML doesn't exactly match Atlas Cloud's current model string.
- Open the model's page on atlascloud.ai, find the `"model"` string in their code example, and update the `apiModel` field in `index.html` (search for `CINEMA_MODELS` or `NSFW_MODELS`).

**"Upload failed"**
- Check the Netlify function logs: Site dashboard → Functions → click `upload-image` → see live logs.

**Polling times out**
- Some heavy models (Veo 3.1, Kling Pro) can take 3–8 minutes. The poll caps at ~8 min.
- For longer waits, increase `maxAttempts` in the `pollStatus` function.

**NSFW models 404**
- Atlas Cloud's NSFW catalog uses specific naming. The names in the HTML are best-guesses. If a model 404s, go to https://www.atlascloud.ai/models/explore/uncensored, find the right model, copy its API identifier, and update the `apiModel` field.

## Costs visibility
- All cost estimates in the UI are at API tier pricing.
- Watch your Atlas Cloud dashboard for actual usage — set a billing alert if you want a safety net.

## Local testing (optional)
If you want to test before deploying:
```bash
npm install -g netlify-cli
cd mmmm-project
netlify env:set ATLASCLOUD_API_KEY "your-key-here"
netlify dev
```
This runs the functions locally at http://localhost:8888.
