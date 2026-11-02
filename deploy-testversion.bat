@echo off
echo ========================================
echo Yamli Mobile Test Version Deployment
echo ========================================
echo.

echo Creating deployment package for yamlimobile.com/testversion/
cd /d "C:\Users\elmok\OneDrive\Documents\GitHub\yamlimobile"

echo Copying files to testversion directory...
xcopy testversion\* testversion-deploy\ /E /I /Y

echo.
echo ========================================
echo Ready to deploy!
echo.
echo Option 1 - Manual Upload:
echo 1. Zip the testversion-deploy folder
echo 2. Upload via Cloudflare Pages dashboard
echo 3. Set custom domain testversion.yamlimobile.com
echo.
echo Option 2 - Command Line (if configured):
echo r2 sync ./testversion-deploy/ r2://yamlimobile-testversion/public/
echo.
echo Option 3 - GitHub Actions:
echo Create branch testversion and deploy from there
echo.
echo Files ready at: testversion-deploy\
echo ========================================
pause