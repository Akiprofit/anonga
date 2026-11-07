# AnoNga — Audit, Bug Hunt, and Android Verification

**Audit date:** 2026-11-03  
**Project:** `C:\AnoNga`  
**Baseline audited:** commit `640ec62` (v1.0, `versionCode 1`)  
**Fixed build:** v1.1, `versionCode 2`, `versionName 1.1`  
**Targets:** Android (Capacitor 6, `com.marc.anonga`, minSdk 22 / targetSdk 34) and web (Vite 5)

This report separates what was **actually reproduced and re-tested** from what is
still an assumption. A successful build alone is not treated as proof. Android
device testing is **not** claimed: the phone disconnected during the audit and
was not connected again before the fixed APK was built.

---

## 1. Final summary (Phase 6 answers)

| Question | Answer |
| --- | --- |
| Confirmed issues discovered | **37 distinct confirmed issues/defects** (38 table rows; `NAV-002` and `AND-001` describe the same Back-button defect) |
| Catalogued rows | **44**: the 38 confirmed rows above, plus **5 accepted risks/limitations** and **1 pass** (`DECK-004`) |
| Addressed in code | **36 of 37** (`CSS-001` accepted as intentional cascades) |
| Verified in a real browser | **23** |
| Verified by build only (not exercised in the browser) | **3**: `DEAD-002`, `DEAD-003`, `AND-006` |
| Implemented but awaiting on-device / fault-injection verification | **4**: Android Back, short-screen color layout, safe areas, storage-quota failure |
| Still open | **0** — every confirmed issue is either fixed or explicitly accepted (`CSS-001`) |
| Browser behavior tested | **Yes** — real Chromium via the in-app browser against `127.0.0.1:5180` |
| Physical Android device tested | **No** — `adb devices` returned no attached device for the final build |
| Android rebuild/sync/reinstall required | **Yes** — assets changed and `@capacitor/app` was added |
| Latest APK built | `C:\Users\Marc\Downloads\AnoNga-1.1.apk` (signed, v1.1, `versionCode 2`) |
| APK SHA-256 | `6DDDAD5D2BE6625881FBCB3BC3790259B710E251982C9BF1FCCDE2E0B6BEDA69` (final build incl. “Praisel” theme rename) |
| Published to GitHub Releases | **Not yet** — publish only after the on-device checks below |

> The v1.1 APK uses the same signing certificate as v1.0
> (`CN=AnoNga …`, cert SHA-256 `a7f42a28f9da4cf271d71ecc057195480cbd4dca1ace153c2611d3c05d6be6df`),
> so it can be installed **over** the existing app without uninstalling and
> without losing collections or favorites.

---

## 2. How the app is wired (Phase 1 findings)

| Area | Actual implementation |
| --- | --- |
| Entry point | `index.html` → `/src/main.js` → `initApp()` in `src/features/app.js` |
| Frontend build | Vite 5 → `dist/` |
| Android assets | `npx cap sync android` copies `dist/` → `android/app/src/main/assets/public/` |
| Capacitor config | `capacitor.config.json`, `webDir: "dist"` (matches build output) |
| Android shell | `MainActivity extends BridgeActivity`; Back now handled in JS via `@capacitor/app` |
| Persistence | `localStorage`: `anonga_language`, `anonga_favorites`, `anonga_custom_decks`, `anonga_imported_decks`, `anonga_handmade_questions`, `anonga_deck_questions`, `anonga_deck_themes` |
| Screen model | Two `<div class="screen">` elements toggled by class; no router/history |
| Play session | In-memory `allDecks`, `currentDeck`, `currentDeckQuestions`, `sessionOrder`, `sessionPosition` |
| Tests | None configured. No lint, type-check, unit, integration, or e2e script exists. |

At audit start, `dist/` and `android/app/src/main/assets/public/` were byte-identical.
After the fixes, `dist/` and the Android assets were re-synced and checked again.

---

## 3. Confirmed issues and status

Severity: **Critical** = crash/data loss/core flow broken; **High** = feature broken or wrong data;
**Medium** = visible defect/workaround needed; **Low** = polish/consistency.

### A. Navigation

| ID | Sev | Issue | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| NAV-001 | Critical | Tapping the icon inside the Decks tab cleared both panes | Handler read `e.target.dataset.tab`; the tapped SVG had no `data-tab` | Read `btn.dataset.tab` from the bound button; `switchTab` falls back to `decks` | **Fixed — browser verified** |
| NAV-002 | High | Android Back exited the app from any screen and could not close modals | `@capacitor/app` was not installed; no JS handler existed | Added `@capacitor/app`; Back closes alert → confirm → other modal → completion → play → exits only from home | **Fixed — device verified** (modal closed; play → home; home → exit) |
| NAV-003 | Medium | No Back control on the collection-details steps | Only the color step had a Back button | Added `manualBackBtn` and `deckDetailsBackBtn`, wired once | **Fixed — browser verified** |

### B. Deck browsing and play

| ID | Sev | Issue | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| DECK-001 | High | Added questions to built-in decks vanished after restart; removed built-in questions returned | Save branch only handled ids starting with `custom_` | Per-deck overrides in `anonga_deck_questions`, loaded at init; add/remove persist and roll back on write failure | **Fixed — browser verified** |
| DECK-002 | High | Handmade questions never persisted | `anonga_handmade_questions` was read but never written | Handmade questions are written on add/remove | **Fixed — browser verified** |
| DECK-003 | Medium | Handmade leaked into “Your Collections” and the Decks grid, with a delete button | Both renderers included every non-default deck | Exclude `isHandmade`/`handmade` from both renderers and hide its delete button | **Fixed — browser verified** |
| DECK-004 | Low | Empty-deck state | Observed correct: clear message, draw/shuffle disabled | No change needed | **Pass (observed)** |
| DECK-005 | Medium | Adding a question left the Collections card showing the old count (e.g. `0 questions`) until a reload | Add/remove updated the deck object but never re-rendered the Collections row or the Decks grid | Both lists re-render after a successful add/remove | **Fixed in code — device retest pending** |
| DECK-006 | Low | “1 questions” pluralisation in the Collections card and deck-info dialog | Hard-coded plural text | Shared `questionCountLabel()` helper | **Fixed in code — device retest pending** |

Play interactions (flip, draw, completion, restart, language toggle, favorite toggle) were
re-tested after the fixes and still work: `1 / 2` → flip → TL text → favorite saved →
`2 / 2` → completion overlay → restart `1 / 2`.

### C. Collection creation

| ID | Sev | Issue | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| CREATE-001 | Critical | Manual creation advanced with no category and saved `collection: ""` | Hidden required input is not constraint-validated; no explicit check | Explicit category validation with custom alert in both workflows | **Fixed — browser verified** |
| CREATE-002 | High | Color-step Back always went to the CSV details step | Hard-wired target | `colorStepOrigin` now records the originating step | **Fixed — browser verified** |
| CREATE-003 | Critical | Cancelled CSV import leaked its questions into the next manual collection | `window_importedQuestions` and `pendingDeckDetails` survived `closeModals()` | `resetCreationFlow()` runs on modal open and on close/cancel; manual path explicitly clears imports | **Fixed — browser verified** |
| CREATE-004 | Medium | Duplicate form bindings could run import/create twice | `onsubmit` and `addEventListener` were both used; modal-open code rebound forms | Every static form is bound exactly once in `setupEventListeners` | **Fixed — browser verified** |
| CREATE-005 | Medium | CSV import showed no success message | Import path had no toast | One toast with the imported count | **Fixed — browser verified (exactly 1)** |
| CREATE-006 | Medium | Native validation bubbles appeared instead of AnoNga dialogs | `required` fields without `novalidate` | Added `novalidate` to all four forms; JS validation shows custom alerts | **Fixed — browser verified** |
| CREATE-007 | Medium | Reopened import kept the previous file attached | File input was never cleared | Forms, file input, categories and color are reset on open/close | **Fixed — browser verified** |
| CREATE-008 | Medium | Color step could clip Back/Create on short screens | Fixed-height children in an `overflow:hidden` step | Flex layout: preview and actions fixed, only swatches scroll; `dvh`-aware preview clamp | **Fixed in code — measured in browser at 747×670; short-device verification pending** |
| CREATE-009 | Low | Confusing “Step 2/3/4” labels and “Create Collection” buttons that only advanced | Historic markup | Step 1 → Step 2 → Final Step; advancing buttons now say **Continue** | **Fixed — browser verified** |
| CREATE-010 | Medium | Color preview always said “0 questions” and kept sample name/description | Preview meta never updated | Preview updates from pending details and imported count | **Fixed — browser verified** |
| CREATE-011 | Medium | On a real phone the keyboard covered Category, Back and Continue in both details steps; the modal could not scroll | Both detail steps had `overflow:hidden` and were taller than the keyboard-shrunk modal | Detail steps now scroll vertically inside the modal | **Fixed in code — device retest pending** |
| CREATE-012 | Low | Color preview header clipped on a 384 dp-wide phone (“KUMUSTAHAN 3”, “3 quest…” cut off) | 160 px-wide preview plus a single-line header | Header stacks number and count in the color step | **Fixed in code — device retest pending** |

**Only the final action creates data.** During manual creation the stored custom-deck
key stayed `null` while moving to the color step and only gained the new record after
**Create Collection** was pressed.

### D. Colors and card themes

| ID | Sev | Issue | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| COLOR-001 | High | Saved color `#3a7ca5` was stored but the card painted the Friendly green gradient | Inline `background-color` was overridden by themed `background` gradient | Custom decks get an inline gradient built from the chosen color; built-in decks keep their theme | **Fixed — browser verified** |
| COLOR-002 | Low | `#5a7a5c` appears twice in the swatch list | Duplicate value in the original palette | **Not changed** — palette deliberately preserved; documented | **Accepted** |
| COLOR-003 | High | A blue (`#3a7ca5`) collection showed a blue deck tile but played with a pink card | `COLOR_THEMES` covered only 6 of the 15 unique swatches, and a custom deck’s creation-time `theme` won over its colour | Every remaining swatch maps to its matching existing theme; custom decks prefer their saved colour unless a theme was explicitly chosen | **Fixed in code — device retest pending** |
| THEME-001 | High | A chosen theme reverted to Friendly after reload | `getDeckTheme()` returned the deck record’s creation-time `theme` before the saved map | Saved theme map is checked first | **Fixed — browser verified** |
| THEME-002 | Low | Theme preview missed font/on-accent variables | Incomplete variable list and computed styles read after the temp element was removed | Copy `--c-font`/`--c-on-accent` before removal along with all other used variables | **Fixed — browser verified** |

### E. Deletion

| ID | Sev | Issue | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| DELETE-001 | Medium | Deletion swallowed write errors; a legacy imported record could resurrect; UI could update before persistence | Only `anonga_custom_decks` was rewritten and storage was not checked | Write first, verify, then mutate UI; remove the record from custom/imported/theme/override/handmade keys; visible failure alert | **Fixed — browser verified (normal path; quota failure not injected)** |
| DELETE-002 | Low | Reusable confirm modal keeps danger styling for non-danger actions | Shared styling | Cosmetic only; not changed | **Accepted** |

### F. Persistence and data integrity

| ID | Sev | Issue | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| DATA-001 | Medium | Failed `setItem` still showed success | Most writes had no error handling | Safe read/write helpers, rollback on failure, custom error alert; theme/favorite writes report failure | **Fixed in code — quota failure not injected** |
| DATA-002 | Low | Question IDs can depend on array position for legacy rows | IDs were not always persisted | Deterministic IDs remain; new writes persist them | **Accepted (low)** |
| DATA-003 | Low | Favorites of a deleted deck remain listed | By design | Documented behavior | **Accepted** |

Verified after reload: custom collections, imported questions, favorites, language,
handmade questions, built-in overrides, deletion, chosen colors and chosen themes all
survived a full page restart.

### G. Dialogs and input controls

| ID | Sev | Issue | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| DLG-001 | Medium | Modals had no dialog semantics; close target was 32×32 px | Markup/CSS | Added `role="dialog"`, `aria-modal`, labelledby where possible; 44×44 close targets | **Fixed — browser DOM verified** |
| DLG-002 | Low | No focus trap; focus could move behind a modal | Basic Tab/Shift-Tab trap added to every open `.modal` | **Fixed in code — browser/device retest pending** |

Category pills were opened/closed three times in a row, clicked repeatedly, and always
left exactly one `.selected` pill and the correct hidden value. No duplicate listeners
appeared.

### H. Security and escaping

| ID | Sev | Issue | Root cause | Fix | Status |
| --- | --- | --- | --- | --- | --- |
| SEC-001 | High | User text was interpolated as raw HTML in deck cards, collections, question preview, favorites and toasts | Missing escaping | `escapeHtml()` for all interpolated values; toasts use `textContent`; inline handlers replaced with listeners | **Fixed — browser verified** |
| SEC-002 | Low | Tampered stored color/theme could inject CSS | No validation | Accept only `#rrggbb`; invalid themes ignored | **Fixed — browser verified** |

XSS test payloads (`<img src=x onerror=…>`, `<script>…</script>`, `<svg onload=…>`)
rendered as literal text; no element was created and no flag was set.

### I. Android / Capacitor

| ID | Sev | Issue | Fix | Status |
| --- | --- | --- | --- | --- |
| AND-001 | High | Android Back exits from anywhere | Same fix as NAV-002; `capacitor.plugins.json` now registers `@capacitor/app` | **Fixed in code — device pending** |
| AND-002 | Medium | `100vh` could hide the footer under browser chrome/keyboard | `height: 100dvh` fallback added | **Fixed — browser verified (CSS applied)** |
| AND-003 | Medium | Modal/play actions could sit under the gesture bar | Safe-area padding added to modal content and play area | **Fixed in code — device pending** |
| AND-004 | Low | Google Fonts needed network on first launch | Fonts are now bundled via `@fontsource`, so the app is fully offline | **Fixed in code — device retest pending** |
| AND-005 | Low | `@capacitor/filesystem` and legacy storage permission remained although the native scanner was removed | Plugin removed from `package.json` and Capacitor sync; file picker still uses the HTML input | **Fixed in code — device retest pending** |
| AND-006 | Low | `capacitor-setup.js` only logged and registered nothing | File and its `<script>` tag removed | **Fixed — verified in build** |

### J. Code quality

| ID | Sev | Finding | Fix | Status |
| --- | --- | --- | --- | --- |
| DEAD-001 | Low | `CapacitorFilesystem` assigned an undeclared variable in a module; scanner unreachable | Entire dead scanner/picker path removed | **Fixed — build + browser verified** |
| DEAD-002 | Low | `playDeckFromInfoBtn`, `openImportStep`, `methodBtnHandler`, `attachModalListeners`, unused `deckCardClick` | Removed | **Fixed** |
| DEAD-003 | Low | Unused storage helpers | Removed; no data touched | **Fixed** |
| CSS-001 | Low | Duplicate `.deck-card`, `.modal-header h2`, `.modal-close` rules remain | The remaining duplicates are intentional responsive/override cascades (media queries and the 44 px touch-target override); no behaviour change | **Accepted (low)** |
| QA-001 | Medium | No automated test suite | Added Vitest + jsdom with 10 tests covering storage and card-theme logic | **Fixed — 10/10 tests passing** |

---

## 4. Potential risks (not confirmed bugs)

1. **CSV dedup is aggressive** — a row is skipped if EN **or** TL matches any existing
   question. A legitimately different question sharing one translation is dropped.
   Left unchanged to avoid altering the established import format.
2. **Malformed CSV** — an unclosed quote merges the rest of the file into one field.
   No syntax error is surfaced.
3. **localStorage quota** — very large imports can exceed ~5 MB. Failures now produce
   an error, but the app still cannot store unbounded data.
4. **Favorites UI is read-only** — there is no remove-from-favorites or play-from-favorites
   action; favorites can only be toggled during play.
5. **No collection editing** — names/descriptions cannot be edited after creation.
6. **Remote fonts** — Google Fonts is fetched at runtime; offline works with fallbacks.
7. **No focus trap** — keyboard focus can leave an open modal.
8. **Google Play** still requires a target-SDK upgrade; direct APK distribution is unchanged.
9. **`npm audit`** reports 7 vulnerabilities in the dev toolchain (Vite/esbuild). They
   affect local tooling, not the shipped local-first UI; a major Vite upgrade is out of scope.
10. **Unused Filesystem plugin** remains packaged; removing it should be a separate,
    device-tested change.

---

## 5. Regression test matrix (actual results)

All browser tests ran against the real app in Chromium at `127.0.0.1:5180`. `localStorage`
was cleared only for browser test data; no Android data was touched.

| # | Test | Result |
| --- | --- | --- |
| 1 | Manual collection is saved only after the final action | **Pass** — storage was `null` before Create Collection |
| 2 | Manual creation requires a category | **Pass** — “Choose a Category”, stayed on details step |
| 3 | CSV import + category during customization | **Pass** — stored `collection: "together"`, 2 questions |
| 4 | CSV success message appears exactly once | **Pass** — 1 toast, “Imported 2 questions.” |
| 5 | Multiple colors update the preview immediately | **Pass** — preview gradient became `rgb(58,124,165)` |
| 6 | Color options reachable; preview/actions not hidden | **Pass at 747×670** — actions visible, swatch list scrolls, last swatch reachable; short-device check pending |
| 7 | Saved color applied to the collection card | **Pass** — card gradient `rgb(58,124,165)`, persisted after reload |
| 8 | Cancel creation creates nothing | **Pass** — three open/cancel cycles created no records |
| 9 | Delete cancel keeps the deck | **Pass** — remained in DOM and storage |
| 10 | Delete confirm removes only the intended deck | **Pass** — only “Cancel Leak Check” removed; other decks intact |
| 11 | Restart persistence | **Pass** — collections, questions, favorites, themes, handmade and overrides survived reload |
| 12 | Existing data intact | **Pass** — 5 built-in decks (60 each) + custom collections + 300 questions unchanged |
| 13 | Category picker repeated open/close | **Pass** — exactly one selected pill, correct hidden value |
| 14 | Manual and CSV workflows independently | **Pass** — both tested separately after shared fixes |
| 15 | Tab icon/text taps keep a valid pane | **Pass** — icon taps on both tabs keep the correct pane |
| 16 | XSS payloads render as text | **Pass** — no element created, no flag set |
| 17 | Malformed/tampered stored color | **Pass** — fallback `#c9846f` used, no injected CSS |
| 18 | Theme survives reload | **Pass** — `ocean` remained after reload; `berry` saved for another deck |
| 19 | Handmade question survives reload | **Pass** — `1 / 1`, text restored, excluded from both lists |
| 20 | Built-in add/remove survives reload | **Pass** — 60 → 61 → 60 after removal |
| 21 | Play: flip/draw/completion/restart/language/favorite | **Pass** |
| 22 | CSV quoted commas, Unicode, blank line | **Pass** — `"Hello, world"` kept as one field; 2 valid rows |

### Physical Android device pass (v1.1)

The phone reconnected late in the audit, so the device pass was completed after the
browser pass. The installed app was a **debug-signed v1.0 test build**, not the
published release APK. v1.1 was therefore installed in place with a debug-signed
v1.1 APK (`adb install -r`), which preserved the app's existing data. No uninstall,
`pm clear`, or storage reset was performed.

Device: `1080×2340`, 450 dpi (≈384×832 dp), three-button/gesture navigation bar
visible. The release APK and the published v1.0 APK share the same certificate
(`a7f42a28…`), so real v1.0 users can update in place; only this debug build on the
test phone requires a different signature for in-place testing.

Verified on the device before the final retest:

- **Android Back:** modal → closed the modal, app remained; play → returned home;
  home → left the app (no crash).
- **Manual creation:** empty form → custom “Missing Fields”; name/description but
  no category → custom “Choose a Category”; category pills selected correctly;
  Back from the color step returned to the manual details step.
- **Color:** swatch list scrolled to the third row, preview changed to blue,
  selected swatch outlined, preview/actions stayed on screen.
- **CSV import:** the system file picker opened the Download folder with CSV files;
  `sample-import.csv` imported with exactly one “Imported 3 questions.” toast;
  the details step showed “3 questions ready to import.”; the saved collection had
  3 questions.
- **Deletion:** Cancel kept the deck; confirm showed the correct name, removed only
  “CSV Device”, showed one toast, and the other collection remained; after
  force-stop/reopen the deletion persisted.
- **Safe areas:** play actions and modal actions sat above the gesture bar.
- **Logcat:** no JavaScript `Uncaught`, `TypeError`, or `ReferenceError` entries;
  only the app's own console logs.

Issues found only on the device (all fixed in code):

- `COLOR-003` — blue collection played with a pink card.
- `DECK-005` — Collections card kept the old question count until reload.
- `DECK-006` — “1 questions”.
- `CREATE-011` — keyboard covered Category/Continue and the modal would not scroll.
- `CREATE-012` — clipped color-preview header.

`COLOR-003` and `DECK-006` were retested on the device and confirmed (blue play
card; “1 question”). `CREATE-011`, `CREATE-012` and `DECK-005` were not retested
because the phone disconnected before that step. The offline-font bundling,
focus-trap and plugin removal changes were also not exercised on hardware. All of
them build and pass the 10 Vitest tests; they still need one on-device
confirmation when the phone is reconnected.

### Not verified

- Storage-quota failure path (not fault-injected).
- Color step below ~600 px CSS height on physical hardware (measured in Chromium at
  670 px only).
- Installing the **release-signed** v1.1 over the debug build on this phone would
  require uninstalling it; that was deliberately not done. Release-to-release
  updates from v1.0 remain supported by the matching certificate.

---

## 6. Commands executed and actual results

| Command | Result |
| --- | --- |
| `npm install @capacitor/app@^6.0.0` | Passed; added 1 package |
| `node --check src/features/app.js` (and storage/cardThemes) | Passed; no syntax errors |
| `npm run build` | **Passed** — Vite 5.4.21, final bundles `index-DQQsu3bw.js` 98.87 kB, `index-DNJXdnjl.css` 57.15 kB |
| `npx cap sync android` | **Passed** — copied `dist/`, found `@capacitor/app@6.0.3` and `@capacitor/filesystem@6.0.4` |
| `./gradlew assembleDebug` | **BUILD SUCCESSFUL** (1 m 5 s) |
| `./gradlew assembleRelease -x lintVitalRelease` | **BUILD SUCCESSFUL** (final rebuild incl. bundled fonts, 26 s) |
| `npm test` | **Passed** — Vitest, 2 test files, 10/10 tests |
| `aapt dump badging app-release.apk` | `com.marc.anonga`, `versionCode 2`, `versionName 1.1`, minSdk 22, targetSdk 34 |
| `apksigner verify app-release.apk` | Exit 0; signed with `CN=AnoNga …` |
| `adb devices` | **No devices attached** |
| Lint / type-check / unit / integration / e2e | **Not configured in the project; not run** |

---

## 7. Files changed

| File | Change |
| --- | --- |
| `src/features/app.js` | Single-bind event setup, explicit creation reset/state, category validation, color-step origin, `createPendingCollection`, theme/color rendering, escaping, persistence for custom/built-in/handmade add/remove, safe delete, Android Back handler, toast via `textContent`, dead scanner removed |
| `src/features/cardThemes.js` | Saved theme map now takes precedence; `saveDeckTheme` returns success/failure |
| `src/features/storage.js` | Safe writes, validated favorites, removed unused helpers |
| `index.html` | `novalidate`, Back/Continue controls, step labels, `accept` on file input, dialog roles, color preview meta hooks, removed dead `csvInput` and `capacitor-setup.js` |
| `src/style.css` | `100dvh`, safe-area padding, 44 px close target, flex color step with scrollable swatches, step action rows |
| `src/capacitor-setup.js` | **Deleted** (dead no-op) |
| `package.json` / `package-lock.json` | Added `@capacitor/app@^6.0.0` |
| `android/app/build.gradle` | `versionCode 2`, `versionName 1.1` |
| `android/app/src/main/assets/public/**` | Re-synced frontend build |
| `README.md` | Version/APK filename/status updated; links to this report |
| `AUDIT_REPORT.md` | This report |
| `dist/**` | Production build output |

No palette values, themes, built-in questions, or Android signing configuration were
changed. Existing user data was not deleted.

---

## 8. Installing the updated APK

**Prerequisites:** USB debugging enabled if using ADB, or a file manager on the phone.

### Option A — ADB (recommended; keeps data)

```powershell
adb install -r "C:\Users\Marc\Downloads\AnoNga-1.1.apk"
```

`-r` reinstalls in place. The APK is signed with the same certificate as v1.0.
**Do not uninstall** the existing app first.

### Option B — On the phone

1. Copy `AnoNga-1.1.apk` to the phone and tap it.
2. Allow **Install unknown apps** if prompted.
3. Tap **Install** / **Update**.
4. Open AnoNga and confirm your collections and favorites are still present.

### After installing, test these manually

1. **Android Back:** open a modal → Back should close only the modal; on the play
   screen → Back should return home; on home → Back should exit.
2. **Manual creation:** submit without a category → custom alert, no advance;
   pick a category → Continue; Back from color returns to manual details;
   Create Collection only then saves.
3. **CSV creation:** import a real CSV via the Android file picker, pick a category,
   confirm exactly one success toast, and verify the question count.
4. **Color step on a short screen:** rotate/use a small device; confirm the preview,
   Back and Create Collection stay visible while only the swatches scroll.
5. **Keyboard:** focus the collection name/description and confirm the keyboard does
   not hide the Continue button.
6. **Safe area:** on a gesture-navigation phone, confirm the color actions and play
   footer sit above the gesture bar.
7. **Persistence:** add a handmade question and a built-in-deck question, force-stop
   the app, reopen, and verify both remain.
8. **Deletion:** delete a collection, cancel once, then confirm; force-stop and reopen
   to verify it stays deleted and other collections remain.

If any of these fail on the device, capture the exact screen and `adb logcat` output
before making further changes.

---

## 9. Honest conclusion

The recurring browser-side defects were reproduced before being changed and were
re-tested afterward: tab blanking, empty-category creation, stale CSV leakage,
wrong Back target, missing import feedback, invisible saved color, reverted themes,
non-persistent handmade/built-in questions, and delete feedback. The fixes are in the
current source and the v1.1 APK contains the rebuilt assets.

The Android-specific changes (Back button, safe areas, short-screen color layout,
keyboard behavior, file picker) are implemented and the project builds, but they were
**not** exercised on a physical phone in this pass. They must not be described as
device-verified until the checks in section 8 are performed.

---

## 10. v1.2 data-safety verification

Added in v1.2: JSON backup and restore, per-collection CSV export, and a
typed-confirmation reset control.

### Automated

- `npm test`: 22/22 tests pass, including 12 new tests for backup validation,
  restore normalization, CSV quoting/BOM, and filenames.
- `npm run build`: production bundle builds cleanly.

### Browser verified

- Back Up Data downloads a valid `anonga-backup-YYYY-MM-DD.json` with all keys.
- CSV export quotes commas, quotes, and line breaks, and includes a UTF-8 BOM.
- Restore upload shows the backup summary, asks for confirmation, and reloads
  with the restored data.
- Reset Cancel preserves data; typing `DELETE` clears only `anonga_*` keys.
- No console errors in any flow.

### Device verified

Samsung RFCY30E0LRT, debug-signed v1.2 installed over v1.1 with no data loss.

- Existing 4 custom collections (201 questions) remained after install.
- Backup share sheet shows `anonga-backup-2026-11-07.json`.
- Export CSV share sheet shows `anonga-para-sarili.csv`.
- Restore: file picker, Downloads, backup, summary "4 custom collections",
  confirm, app reloads with all 4 collections and the deck theme.
- Reset modal renders correctly; Cancel preserves data.
- No user data was cleared during verification.

Release APK: `AnoNga-1.2.apk`, versionCode 3, signed.
SHA-256: `586B1D6E2D5055A8CD90AE8C0430DCB36CCF1833B385F2414FCEDDA8519B5446`

---

## 11. v1.3 feature verification

Added in v1.3: deck and question search, bulk question deletion, and
cross-collection duplicate questions.

### Automated

- `npm test`: 22/22 tests pass.
- `npm run build`: production bundle builds cleanly.

### Browser verified

- Search matches deck names, deck descriptions, English questions, and Taglish
  questions.
- Tapping a question result opens its collection at the matching card.
- Clear search restores the collection tabs and deck grid.
- Bulk selection shows the selected count, supports select-all and partial
  selection, and disables delete when nothing is selected.
- Bulk delete asks for confirmation, removes only the selected questions,
  updates the deck count, and persists after reload.
- An identical question in a different collection is accepted silently.
- An identical question in the same collection is blocked with the custom
  duplicate modal.
- Test collections used for verification were deleted afterward; the five
  built-in decks still contain 300 questions.
- No console errors after the final fix.

### Fixed during verification

- `handleAddQuestion`, `removeQuestion`, and bulk delete called the removed
  `renderDecks` helper. They now call `renderDecksList`, so the deck grid and
  question preview refresh immediately after add/delete.

### Not verified

- Physical Android device pass for v1.3. Browser verification only.

Release APK: `AnoNga-1.3.apk`, versionCode 4, signed.
SHA-256: `F9EAC87FFEF4195007B3CFA0A09F79254C124356E30259FB7A23BE7B768D6CFC`

