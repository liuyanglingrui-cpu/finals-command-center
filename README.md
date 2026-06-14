# Finals Command Center

A mobile-first study planner for finals season. Add subjects, exam dates, chapters,
available study hours, and review logs, then let the app generate a daily review
schedule in your browser.

Live app: https://finals-command-center.netlify.app

## Features

- Subject and chapter management
- Exam countdowns and progress tracking
- Automatic schedule generation based on exam dates, difficulty, priority, and daily availability
- Smart text import for exam plans and chapter lists
- Daily review logs
- Local-first data storage with `localStorage`
- PWA support for adding the app to a phone home screen

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vitest
- Netlify

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

```bash
npm run dev
npm test
npm run lint
npm run build
```

## Data And Privacy

The app stores study data in the current browser's `localStorage`. It does not
upload subject, chapter, schedule, or review data to a server.

Clearing browser data may delete saved study data.

## Deployment

The included `netlify.toml` config deploys the Next.js app to Netlify:

```toml
[build]
  command = "npm run build"
  publish = ".next"
```

## License

MIT
