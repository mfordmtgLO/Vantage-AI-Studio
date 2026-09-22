# Automated GitHub to Google Cloud Run CI/CD Guide
*Author: Mike Ford <fordmj@gmail.com> | Vantage AI Workspace*

This repository is now equipped with automated CI/CD deployment configurations. Whenever you sync your workspace to GitHub, you can have Cloud Run automatically build and deploy the latest revision.

---

## Method 1: The Recommended 2-Minute Setup in Cloud Run (Zero Secrets Required)

Google Cloud Run has native GitHub integration that builds directly with Google Cloud Build:

1. Open your **Google Cloud Run console**:
   `https://console.cloud.google.com/run/detail/us-west2/vantage-ai-workspace`
2. Click the **"Edit & Deploy New Revision"** button (or click **"Set up continuous deployment"** in the top action bar).
3. Under the **Deployment trigger** section:
   - Select **"Continuously deploy from a repository"**.
   - Click **"Set up Cloud Build"**.
4. Configure the repository connection:
   - **Repository Provider**: Select **GitHub**.
   - **Repository**: Select your repository (`fordmj/vantage-ai-workspace` or your repository name).
   - **Branch**: Select `^master$` or `^main$`.
   - **Build Type**: Select **Dockerfile** (path: `/Dockerfile`) or **Cloud Build configuration file** (path: `/cloudbuild.yaml`).
5. Click **Save** and **Deploy**.

**That's it!** Every time you click **"Sync with GitHub"** in Google AI Studio, Cloud Build will instantly trigger a new build and deploy it as the active revision on Cloud Run.

---

## Method 2: GitHub Actions (Alternative)

If you prefer deploying directly through GitHub Actions:
1. In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
2. Create a repository secret named `GCP_SA_KEY` containing your Google Cloud Service Account JSON Key (with `Cloud Run Admin` and `Service Account User` roles).
3. The `.github/workflows/deploy-cloud-run.yml` workflow will automatically trigger and deploy on every push to `master` or `main`.

---

## Files Configured in This Repository

- **`Dockerfile`**: Multi-stage, production-optimized container running Node 22, compiling the React client SPA and bundling the CommonJS Express server to port 3000.
- **`cloudbuild.yaml`**: Google Cloud Build pipeline that builds the container image and deploys to `vantage-ai-workspace` in `us-west2`.
- **`.github/workflows/deploy-cloud-run.yml`**: GitHub Actions automated pipeline.
