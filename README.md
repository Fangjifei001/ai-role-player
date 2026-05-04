# AI Role Player

Production-style MVP for scenario and persona management with learner and admin workflows.

## Routes

- `/dashboard` - learner setup (scenario/persona selection + preview)
- `/admin` - runtime scenario/persona CRUD and behavior configuration

## Local Run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run build
```

## Architecture Notes

- Frontend-first Next.js App Router implementation.
- Runtime admin data persistence uses browser storage so dashboard reflects updates without rebuild.
