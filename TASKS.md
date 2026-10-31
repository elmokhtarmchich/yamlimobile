# Task Coordination

| Task | Owner | Status | Notes |
| --- | --- | --- | --- |
| Add project state and task tracking | Codex | Complete | `STATE.md` and this file |
| Add Gitleaks secret scanning | Codex | Complete | Pull request and push workflow |
| Add additional CI safety checks | Codex | Complete | CodeQL and dependency review |
| Fix Google search button | Codex | Complete | Added the missing `searchtext()` handler |
| Document agent startup requirements | Codex | Complete | Added `AGENTS.md` requiring `STATE.md` and `TASKS.md` first |
| Use device default search provider | Codex | Blocked by web platform | Browser JavaScript cannot access or invoke the configured provider generically |
| Verify changes | Codex | Complete locally | JavaScript syntax, diff check, required-file check, and browser smoke test passed |
| Commit and push requested changes | Codex | Complete | Pushed commit `d1f0c43` to `origin/main` |
| Fix share and translate buttons | Codex | Complete | Share uses Web Share with clipboard fallback; translate opens encoded Google Translate URL |
| Commit and push share/translate fixes | Codex | Complete | Pushed commit `4d61598` to `origin/main` |
| Fix Samsung Internet translation handoff | Codex | Complete | Samsung Internet now shares the text payload instead of launching a blank app URL |
| Add secure DeepL Translation API path | Codex | Complete | `DEEPL_API_KEY` attached; old `GOOGLE_TRANSLATE_API_KEY` removed; Arabic `مرحبا بالعالم` translated successfully |
| Harden Worker admin auth and rate limits | Codex | Implemented locally; production pending | Removed the bundled password, added `ADMIN_PASSWORD` secret validation and Cloudflare rate-limit bindings; deployment requires secret rotation |
| Try local LibreTranslate prototype | Codex | Complete | Temporary localhost-only container translated `Hello` to `Bonjour`; container was stopped after testing |
| Run HTTPS mobile test server | Codex | Complete | Static site on port 8000 exposed at `https://two-zoos-sin.loca.lt`; endpoint verified with HTTP 200 |
| Add translated text display section | Codex | Complete | Added hidden output section, Worker result display, and Google Translate handoff button; browser smoke test returned `Bonjour` |
| Restore historical Google Translate handoff | Codex | Complete | Restored Android `navigator.share()` behavior from commit `bc0c096`; simulated Android test confirmed `{ title: "Translate", text: "مرحبا" }` |

| Test desktop version locally | Codex | Complete | Local server test passed: `Hello` translated to `Bonjour`; translated output section displayed correctly |
| Replace Google translation handoff with DeepL | Codex | Complete | Removed Google handoff paths; output button now opens DeepL with translated text and language |
| Disable empty-input actions | Codex | Complete | Share, search, cut, copy, listen, and translate are disabled without valid input; translation requires Arabic text |
| Add translation section visibility toggle | Codex | Complete | Compact eye button appears after translation and hides/restores the complete translated output section |
| Expand standalone translation panel actions | Codex | Complete | Moved translation outside the Yamli editor and added Material eye, share, search, copy, and narration controls |
| Integrate v3 favicon set | Codex | Complete | Replaced old favicon references/assets with the updated files from `images/favicon/v3`; verified local asset responses |
| Add Latin font fallback and repair translation actions | Codex | Complete | Added JetBrains Mono with Arabic fallback, restored missing formatting handlers, and made translated actions real buttons |
| Refine display font and Arabic-only font control | Codex | Complete | Applied the Latin font stack to site/output/input defaults and disabled the font selector unless Arabic text is present |
| Expand Arabic font selector | Codex | Complete | Added four Arabic font choices, imported all nine selector fonts, and verified the browser loads each one |
| Center editor text horizontally and vertically | Codex | Complete | Updated the alignment button to center short and multiline text and restore the original alignment when toggled off |
| Fix and persist page theme toggle | Codex | Complete | Implemented light/dark switching, synchronized the icon and browser theme color, and verified the saved preference survives reload |
| Add Donate and Support page | Codex | Complete | Added a responsive bilingual support layout, main-page Donate CTA, Stripe Buy Button, refund-policy link, and email fallback |
| Add return-policy route | Codex | Complete | Added a contribution refund policy at `/return-policy/`, linked from Support, sitemap, and PWA cache |
| Style copyright Latin text and PWA install control | Codex | Complete | Split copyright language spans and replaced the text install control with `icon/pwa.svg` |
| Update copyright year and preserve PWA button height | Codex | Complete | Updated the Latin copyright year to 2026 and kept the icon-only install button at 40px height |
| Display full PWA badge and style version badge | Codex | Complete | Preserved 40px badge height, restored the SVG's natural width, and applied JetBrains Mono to `v1.0` |
| Add ad-blocker guidance button | Codex | Complete | Added an accessible help toggle; browsers do not allow websites to disable blockers automatically |
| Verify GitHub security workflows | Codex | Complete | Secret scan and Security checks succeeded on `main` at `a49b440` on 2026-10-30 |

## Handoff rules

1. Update the status and notes in this file when starting or completing a task.
2. Record blockers in `STATE.md` under coordination notes.
3. Keep unrelated worktree changes untouched.
