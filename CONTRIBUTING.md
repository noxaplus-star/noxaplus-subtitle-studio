# Contributing to NoxaPlus Subtitle Studio

Thanks for helping improve NoxaPlus Subtitle Studio. This project is a local-first,
privacy-first subtitle editor, and contributions should preserve that promise.

## Getting started

Requirements: Node.js 20 or newer.

```bash
git clone https://github.com/noxaplus-star/noxaplus-subtitle-studio.git
cd noxaplus-subtitle-studio
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run typecheck
npm test
npm run build
```

## How the project is organized

- `src/core/` contains framework-free TypeScript for parsing, serialization, Persian text
  cleanup, validation, timing, and editing operations. Every non-trivial rule belongs here
  with tests.
- `src/components/` contains React components. Keep UI state local and presentation in CSS.
- `src/hooks/` contains project history, video, and install-prompt behavior.
- `src/i18n.tsx` contains the typed Persian and English dictionaries. Every user-facing
  string must exist in both languages.
- `src/styles.css` contains design tokens and responsive styles. Use CSS logical
  properties (`margin-inline`, `inset-inline-start`, and so on) so RTL and LTR both work.

## Guidelines

### Keep it local

Do not add analytics, telemetry, remote logging, external font/CDN requests, or any feature
that uploads subtitle or video content. New runtime network requests need a clear privacy
discussion in an issue first.

### Keep the core pure

Subtitle logic in `src/core/` must not depend on React or the DOM. Add tests alongside the
module using Vitest. Prefer small, explicit functions and typed inputs.

### Preserve user work

Any destructive editing action must go through the project history so it can be undone.
Autosave must fail safely. New persisted fields must be validated in `src/storage.ts`.

### UI and accessibility

- Add both Persian and English strings, with natural phrasing in each language.
- Use semantic elements and label every control.
- Keep visible focus states and keyboard access for new interactions.
- Test layouts at desktop, tablet, and small-phone widths, in both RTL and LTR.
- Respect `prefers-reduced-motion`.

### Persian text rules

Persian cleanup rules must be tag-aware and must not modify timing or markup. When adding a
rule, include tests for correct cases, false positives, URLs, and email addresses.

## Commits and pull requests

- Use focused branches such as `fix/cps-threshold` or `feat/find-replace`.
- Write imperative commit subjects, for example `Add Persian digit protection for URLs`.
- Describe the problem, the approach, and how you tested it.
- Link the related issue when possible.
- Include screenshots for visual changes, in both themes or languages when relevant.
- Keep pull requests small enough to review carefully.

## Reporting bugs

Open a GitHub issue with:

- The subtitle format and a minimal sample if the bug depends on input.
- Browser and operating system.
- Steps to reproduce, expected behavior, and actual behavior.
- Console errors, if any. Remove any private subtitle text before sharing.

For security vulnerabilities, follow [SECURITY.md](SECURITY.md) instead.

## Translations

The application ships with Persian and English. To improve a translation, update the
matching key in both dictionaries in `src/i18n.tsx`. Keep placeholders such as `{count}`
intact, and check that the interface still fits on narrow screens.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
