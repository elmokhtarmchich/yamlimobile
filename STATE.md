# Project State

Last updated: 2026-10-31

## Current work

- Roll out Worker admin authentication and rate limits after rotating the exposed admin password.

## Verification status

- [x] Run the browser smoke check for the Google search button.
- [x] Run the repository safety workflows in GitHub Actions.
- [x] Verify Worker authentication, rate limiting, and Wrangler deployment configuration locally.
- [x] Confirm the working tree contains only intentional changes.

## Coordination notes

- Desktop local test passed on `http://127.0.0.1:8000`: `Hello` translated to `Bonjour` and appeared in the translated text section. The local server remains running for further testing.
- Google translation handoff was removed from the frontend. The translated output button now opens DeepL's web translator with the text and target language.
- Text-dependent controls now gray out when the input is empty. The translate control remains disabled for non-Arabic text; desktop smoke tests passed for empty, English, and Arabic input states.
- The translated-text section now has a compact eye toggle that appears after the first translation and can hide or restore the whole section.
- The translation panel is now outside the Yamli editor container. It uses a local Material visibility icon and includes translated-text share, search, copy, and narration actions.
- The translation visibility icon is explicitly white for consistent contrast in both themes.
- Favicon migration complete: the old `images/favicon/` assets and stale `browserconfig.xml` were replaced with the v3 SVG, ICO, Apple touch, 96x96, and maskable 192x192/512x512 assets. HTML, manifest, service worker, and notification code now reference the new files. Local HTTP checks returned 200 for every favicon asset and `/site.webmanifest`.
- JetBrains Mono is now used for Latin text with Amiri as the Arabic fallback. Missing Yamli formatting handlers were restored, and translated action controls were converted to real buttons; desktop tests show no related `ReferenceError` errors.
- The display font stack now applies consistently to the site, translated output, and Yamli input. The font selector is Arabic-only; Latin text follows the font selected for the input.
- Copyright Latin text is explicitly JetBrains Mono while Arabic remains Amiri. The PWA install control now uses `icon/pwa.svg` with an accessible label.
- Copyright year is now 2026. The icon-only PWA install button has an explicit 40px width and height, preserving the old button height.
- The PWA SVG now renders at its natural width with an exact 40px height, and the Latin `v1.0` version badge uses JetBrains Mono.
- Added an accessible ad-blocker guidance button. It reveals instructions because a website cannot disable browser extensions or content blockers programmatically.

- The existing modification in `.kilo/kilo.jsonc` predates this work and is intentionally left unchanged.
- The main site is a static HTML/CSS/JavaScript app; the notification worker and Android keyboard are separate subprojects.
- GitHub Actions Secret scan and Security checks succeeded on `main` at `a49b440afe93f083e035763242db1d615719ea5c` on 2026-10-30.
- Browser pages cannot reliably invoke a user's configured default search provider; the Web Platform does not expose that setting. The current search action therefore keeps an explicit web search URL until a provider-selection UX is added.
- The requested changes were committed and pushed; `.kilo/kilo.jsonc` remains intentionally excluded.
- Share and translate toolbar fixes are complete and passed browser smoke tests.
- The share/translate fixes were committed and pushed; `.kilo/kilo.jsonc` remains excluded.
- Samsung Internet translation handoff is fixed: it shares the text payload, while Chrome/PWA keep the direct Translate URL path.
- The frontend targets `https://muddy-glade-1ceb.elmokhtar-mchich.workers.dev/translate`; DeepL support is deployed and `DEEPL_API_KEY` is attached to the Worker. The unused `GOOGLE_TRANSLATE_API_KEY` secret was removed. Arabic translation tests succeed.
- Worker admin authentication now uses the `ADMIN_PASSWORD` Worker secret, and API/admin routes use Cloudflare rate-limit bindings. The previously published password must be rotated and the Worker redeployed; this checkout does not contain or set the new secret.
- Donate and Support page has a responsive, theme-aware layout with the Stripe Buy Button, refund-policy link, and `support@yamlimobile.com` fallback.
- Return/refund policy is available at `/return-policy/` and linked from the Support page; it covers voluntary contributions, mistaken/duplicate payments, and recurring-support cancellation.
- LibreTranslate local prototype smoke test passed in a temporary localhost-only Docker container: `Hello` translated to `Bonjour`; the container was stopped afterward.
- Mobile test server is running on port 8000 and is exposed through LocalTunnel at `https://two-zoos-sin.loca.lt`; first-time visitors may see LocalTunnel's IP confirmation page.
- Initial translated-text UI smoke test returned `Bonjour`; its Google Translate output handoff was later replaced by the current DeepL action.
- Historical Google Translate handoff restored from commit `bc0c096`: Android now uses `navigator.share()` so Google Translate can be selected and receives the text. Web Share does not standardize target-language parameters; the language must be chosen in the app.
- Simulated Android browser test confirmed the restored handler sends `{ title: "Translate", text: "مرحبا" }`; real-device validation should use the current HTTPS tunnel.
