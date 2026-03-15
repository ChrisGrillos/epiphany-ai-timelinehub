# Epiphany AI Timeline Hub

**Welcome to your Base44 project**

**About**

View and Edit your app on [Base44.com](http://Base44.com)

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:**

1. Clone the repository using the project's Git URL
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

5. Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

## Cloudflare Deployment

This project deploys to Cloudflare Workers via the GitHub Actions workflow in
`.github/workflows/deploy.yml`. Every push to the `main` branch triggers a
build and deploy.

### Required GitHub Secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

### Important: Disable Cloudflare Git Integration

If Cloudflare created a `cloudflare/workers-autoconfig` branch, that means a
**Cloudflare git integration** was set up alongside the GitHub Actions deploy.
The git integration may deploy stale code from that branch, overriding the
latest code deployed by GitHub Actions from `main`.

**To fix this**, go to your Cloudflare dashboard:

1. Navigate to **Workers & Pages → epiphany-ai-timelinehub → Settings → Build**
2. **Disconnect** the Git integration (or change the production branch to `main`)
3. Rely solely on the GitHub Actions workflow for deployments

This ensures the latest code from `main` (including the DocumentViewer for
.docx files) is always what gets deployed.

### Manual Deploy

```bash
npm run deploy
```

This builds and deploys using Wrangler directly.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
