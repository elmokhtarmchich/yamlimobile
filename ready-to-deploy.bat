@echo off
echo ========================================
echo Yamli Mobile Test Version - Ready to Deploy!
echo ========================================

echo.
echo Files are ready at: testversion-deploy/
echo.
echo To deploy to yamlimobile.com/testversion/:
echo.
echo Option 1 - Cloudflare Pages:
echo 1. Go to https://dash.cloudflare.com/pages
echo 2. Create new project
echo 3. Connect GitHub repo
echo 4. Set build output: testversion-deploy
echo 5. Set custom domain: testversion.yamlimobile.com
echo.
echo Option 2 - Direct Upload:
echo 1. Zip testversion-deploy folder
echo 2. Upload to your hosting /testversion/ directory
echo.
echo Option 3 - Git:
echo 1. Commit testversion-deploy folder to git
echo 2. Push and configure Pages to deploy from this branch
echo.
echo Test URLs will be:
echo - Main: https://testversion.yamlimobile.com/
echo - Dictionary: https://testversion.yamlimobile.com/dictionary.html
echo.
echo ========================================