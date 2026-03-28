# vitepress

```bash
find . -type f -not -name "*.mdx" -not -name "*.md" -delete
find . -name "*.mdx" -exec sh -c 'mv "$1" "${1%.mdx}.md"' sh {} \;
find . -depth -type d -empty -delete

ln -s ./.github/skills ./.trae/skills
```
