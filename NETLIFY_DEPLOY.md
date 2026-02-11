# 🚀 Deploying LabLink to Netlify

This guide will help you deploy the **LabLink Frontend** to Netlify quickly and easily.

## Prerequisite

Ensure you have a [Netlify account](https://app.netlify.com/signup).

## Option 1: Drag & Drop (Easiest)

1.  **Build the project locally:**
    Open your terminal in the `blood-bank-app` directory and run:
    ```bash
    npm run build
    ```
    This will create a `build` folder.

2.  **Deploy:**
    - Go to [Netlify Drop](https://app.netlify.com/drop).
    - Drag and drop the `build` folder you just created into the upload area.
    - Your site will be live instantly!

## Option 2: Continuous Deployment via GitHub (Recommended)

1.  **Push your code to GitHub.**
2.  Log in to Netlify and click **"Add new site"** > **"Import an existing project"**.
3.  Select **GitHub**.
4.  Authorize Netlify and choose your `LabLink` repository.
5.  Configure the build settings:
    - **Base directory:** `blood-bank-app`
    - **Build command:** `CI=false npm run build` (or just `npm run build`)
    - **Publish directory:** `blood-bank-app/build`
6.  Click **"Deploy site"**.

## detailed Configuration (netlify.toml)

We have included a `netlify.toml` file in the root directory to handle configuration automatically.

```toml
[build]
  base = "blood-bank-app"
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"
  CI = "false"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

With this file present, Netlify should auto-detect the correct settings when you import the repository.

## Troubleshooting

- **Page Not Found (404) on Refresh:**
  Single Page Applications (SPAs) like React need a redirect rule. The `netlify.toml` handles this:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- **Build Failures:**
  Ensure `CI=false` is set in the environment variables if warnings are treating as errors.
