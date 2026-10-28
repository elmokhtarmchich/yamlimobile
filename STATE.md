# Project State

Last updated: 2026-10-28

## Current work

- Add repository coordination and task tracking.
- Add secret-scanning and dependency-safety checks in GitHub Actions.
- Repair the Google search toolbar button on the main page.

## Verification status

- [x] Run the browser smoke check for the Google search button.
- [ ] Run the repository safety workflows in GitHub Actions.
- [x] Confirm the working tree contains only intentional changes.

## Coordination notes

- The existing modification in `.kilo/kilo.jsonc` predates this work and is intentionally left unchanged.
- The main site is a static HTML/CSS/JavaScript app; the notification worker and Android keyboard are separate subprojects.
- The GitHub Actions workflows still need to run in GitHub after they are pushed.
- Browser pages cannot reliably invoke a user's configured default search provider; the Web Platform does not expose that setting. The current search action therefore keeps an explicit web search URL until a provider-selection UX is added.
- The requested changes were committed and pushed; `.kilo/kilo.jsonc` remains intentionally excluded.
