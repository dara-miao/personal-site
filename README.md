# daramiao.com

Personal site for [Dara Miao](https://daramiao.com). A minimal single-page hub: bio, inline links, and a scroll-reveal footer.

**Live:** [daramiao.com](https://daramiao.com)

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Geist Sans](https://vercel.com/font)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint
```

## Editing content

All copy and links live in one file:

```
src/content/site.ts
```

Update `name`, `role`, `email`, `social`, and `paragraphs` there. The page renders those paragraphs with inline links via `WorkParagraph`.

## Project layout

```
src/
  app/
    page.tsx          # page layout (hero, body, footer)
    layout.tsx        # fonts, metadata
    globals.css       # theme tokens and footer styles
  components/
    work-paragraph.tsx
    email-copy-link.tsx
    reveal-footer.tsx # scroll footer + canvas animation
  content/
    site.ts           # site copy (edit here)
public/
  headshot.png
```

## Deploy

Deployed on [Vercel](https://vercel.com). Connect the repo and point `daramiao.com` DNS to Vercel when ready.
