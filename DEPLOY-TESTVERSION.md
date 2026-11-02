# Deploying Yamli Mobile Test Version to yamlimobile.com/testversion/

## Overview
This guide explains how to deploy the test version of Yamli Mobile Pro to `yamlimobile.com/testversion/`

## Files Structure
```
yamlimobile/
├── testversion/
│   ├── index.html (main test landing page)
│   ├── dictionary.html (test dictionary)
│   ├── style.css (styles)
│   ├── robots.txt
│   └── site.webmanifest
└── DEPLOY-TESTVERSION.md (this file)
```

## Deployment Steps

### Option 1: Cloudflare Pages (Recommended)

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Navigate to Pages > Create project

2. **Connect Repository**
   - Connect to this GitHub repository
   - Select the main branch

3. **Configure Build Settings**
   - Build command: (empty for static files)
   - Build output directory: `testversion`

4. **Custom Domain**
   - After deployment, add custom domain: `testversion.yamlimobile.com`

5. **Update DNS**
   - Add CNAME record for `testversion.yamlimobile.com` pointing to Cloudflare

### Option 2: Direct File Upload

1. **Zip the Files**
   ```bash
   cd testversion
   zip -r ../testversion.zip *
   ```

2. **Upload via Cloudflare R2 or FTP**
   - Upload testversion.zip to your hosting
   - Extract files in the `/testversion/` directory

### Option 3: Git-Based Deployment

1. **Create Test Branch**
   ```bash
   git checkout -b testversion
   git add testversion/
   git commit -m "Add test version"
   git push origin testversion
   ```

2. **Configure Cloudflare Pages**
   - Use testversion branch for deployment

## Post-Deployment

1. **Test the URLs**
   - Main test page: https://testversion.yamlimobile.com/
   - Dictionary: https://testversion.yamlimobile.com/dictionary.html

2. **Update Main Site Links**
   - Add links from main site pointing to test version

## Test Version Features

- Complete Franco-Arabic editor interface
- Interactive dictionary with root exploration
- Material Design 3 UI (exact Google Stitch copy)
- Mobile-optimized responsive design
- RTL support for Arabic
- Real-time transliteration

## Rollback Instructions

If issues arise:
1. Disable the test version in Cloudflare Pages dashboard
2. Redirect testversion.yamlimobile.com to maintenance page
3. Fix issues and redeploy