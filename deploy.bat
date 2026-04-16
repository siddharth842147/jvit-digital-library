@echo off
echo ==============================================
echo Installing gh-pages...
echo ==============================================
cd frontend
call npm install gh-pages --save-dev

echo.
echo ==============================================
echo Deploying to GitHub Pages...
echo ==============================================
call npm run deploy

echo.
echo ==============================================
echo Deployment command completed!
echo ==============================================
echo Please go to your GitHub repository Settings -^> Pages,
echo and set the source branch to "gh-pages".
echo.
echo Your link will be: https://siddharth842147.github.io/jvit-digital-library
echo ==============================================
pause
