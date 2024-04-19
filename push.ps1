npm run package
git add .
git commit -m "test"
git tag -d v1.0
git push --delete origin v1.0
git tag -d v1.0
git push --follow-tags
