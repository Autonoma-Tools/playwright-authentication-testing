# Playwright Authentication: Cut Login Time by 80% with storageState

Companion code for the Autonoma blog post 'Playwright Authentication: Cut Login Time by 80% with storageState'. A minimal, runnable suite covering every auth pattern in the article.

> Companion code for the Autonoma blog post: **[Playwright Authentication: Cut Login Time by 80% with storageState](https://getautonoma.com/blog/playwright-authentication-testing)**

## Requirements

Node 20+, Playwright v1.50+

## Quickstart

```bash
git clone https://github.com/Autonoma-Tools/playwright-authentication-testing.git
cd playwright-authentication-testing
npm install && npx playwright install chromium && cp .env.example .env && npx playwright test --project=setup && npx playwright test
```

## Project structure

```
.env.example
examples/
  api-login-run.sh
  auth-setup-run.sh
playwright.config.ts
src/
  api-login.setup.ts
  auth.setup.ts
  multi-role.setup.ts
  parallel.setup.ts
  session-validator.fixture.ts
```

- `src/` — primary source files for the snippets referenced in the blog post.
- `examples/` — runnable examples you can execute as-is.
- `docs/` — extended notes, diagrams, or supporting material (when present).

## About

This repository is maintained by [Autonoma](https://getautonoma.com) as reference material for the linked blog post. Autonoma builds autonomous AI agents that plan, execute, and maintain end-to-end tests directly from your codebase.

If something here is wrong, out of date, or unclear, please [open an issue](https://github.com/Autonoma-Tools/playwright-authentication-testing/issues/new).

## License

Released under the [MIT License](./LICENSE) © 2026 Autonoma Labs.
