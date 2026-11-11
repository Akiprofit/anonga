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

### Device verified

Samsung RFCY30E0LRT. Debug-signed v1.3 installed over debug-signed v1.2 with
`adb install -r`; no data loss.

- 4 custom collections, 201 questions, and the `dark-cherry` theme remained.
- Search matched deck names, deck descriptions, English questions, and Taglish
  questions.
- Tapping a question result opened Getting to Know at `20 / 60`.
- Temporary deck: added 3 questions; an exact same-deck duplicate was blocked;
  the same question in another temporary deck was accepted.
- Bulk-selected 2 questions, confirmed deletion, and verified 1 remained after
  reload.
- Temporary decks were deleted afterward; the real 4 collections, 201
  questions, and theme were unchanged.
- No fatal logcat errors.

### Signing note

The installed v1.2 app was debug-signed. The published v1.3 APK is
release-signed, so installing it over v1.2 would fail the signature check and
require an uninstall, which deletes app data. The device test used a
debug-signed v1.3 build with the same code to preserve user data. The release
APK itself was not installed on the device.

### Not verified

- Release-signed `AnoNga-1.3.apk` on a physical Android device.

Release APK: `AnoNga-1.3.apk`, versionCode 4, signed.
SHA-256: `F9EAC87FFEF4195007B3CFA0A09F79254C124356E30259FB7A23BE7B768D6CFC`

---

## 12. v1.4 card font fix

v1.3 added bulk question selection styles that used the global
`.question-text` selector. Those rules set `font-size: 13px` and overrode the
card question size, shrinking card text to roughly 15px on a phone.

### Fix

- Scoped the bulk preview styles to `.questions-preview`, so they no longer
  reach the play card.
- Removed the `.question-text.is-long` and `.question-text.is-xlong` shrink
  rules and the `toggleLongText` calls that applied them.
- Card question text is now fixed at the existing large size for every card,
  including long questions. No other text sizes changed.

### Automated

- `npm test`: 22/22 tests pass.
- `npm run build`: production bundle builds cleanly.

### Device verified

Samsung RFCY30E0LRT. Debug-signed v1.4 installed over debug-signed v1.3 with
`adb install -r`; no data loss.

- Card question computed font: `29.6225px` (was `14.95px` before the fix).
- Question preview list font remains `14.95px`.
- Questions of 90, 212, and 355 characters all kept `29.6225px`. Long
  questions scroll inside the card body instead of shrinking.
- 4 custom collections, 201 questions, and the `dark-cherry` theme remained.
- Temporary test collection deleted afterward; real data unchanged.
- No fatal logcat errors.

### Not verified

- Release-signed `AnoNga-1.4.apk` on a physical Android device.

Release APK: `AnoNga-1.4.apk`, versionCode 5, signed.
SHA-256: `A5FAC7CF13D9E08241B0C593263A967F379CF2D6A292CFE1890F042414694B24`

---

## 13. v1.5 card text auto-fit

v1.4 kept the card font fixed at the large size. Very long questions then
overflowed the card and could not be read in full without scrolling inside the
card.

### Fix

- Added `fitCardQuestionText()` in `src/features/app.js`.
- Card question text starts at the existing large CSS size.
- If the question overflows the card body, the font is reduced with a binary
  search only as much as needed for the full text to fit.
- The minimum fitted size is `12px`; short questions keep the large size.
- The fit runs after each card render, after fonts load, and on resize or
  orientation change.
- No other text sizes changed.

### Automated

- `npm test`: 22/22 tests pass.
- `npm run build`: production bundle builds cleanly.

### Device verified

Samsung RFCY30E0LRT. Debug-signed v1.5 installed over debug-signed v1.4 with
`adb install -r`; no data loss.

- Short card questions kept the large `29.6225px` size.
- Long questions auto-fit and display in full inside the card.
- 4 custom collections, 201 questions, and the `dark-cherry` theme remained.
- Temporary test collection deleted afterward; real data unchanged.
- No fatal logcat errors.

### Not verified

- Release-signed `AnoNga-1.5.apk` on a physical Android device.

Release APK: `AnoNga-1.5.apk`, versionCode 6, signed.
SHA-256: `50D44F7AD0042193C3FA1098DAE7EFBE8F9076CC3C203AF15E0916CD370E0839`

## 14. v1.6 automatic backup across reinstall

Android deletes app-private storage on uninstall. v1.5 only had a manual JSON
backup through the share sheet, so a user who uninstalled without backing up
lost every collection, question, favorite, and theme.

### Fix

- After every data change, AnoNga writes a JSON backup to shared storage:
  `Documents/AnoNga/anonga-autosave.json`.
- The write is debounced (`700ms`), flushed on `pagehide` and when the app goes
  to the background, so the file stays current.
- On a fresh install, the app reads that file before loading any deck and
  restores it automatically.
- Restore is gated by the local marker `anonga_autorestore_checked`, so an
  ordinary update does not overwrite newer local data with an older backup.
- Favorites and language changes dispatch `anonga:data-changed`, so they also
  trigger a backup.
- `Reset App Data` writes an empty backup first. If that write fails, the reset
  is stopped instead of leaving a backup that would restore deleted data.
- Added `android:hasFragileUserData="true"` and
  `WRITE_EXTERNAL_STORAGE` with `android:maxSdkVersion="29"`. Legacy external
  storage was already enabled.
- Updated the **YOUR DATA** copy in `index.html` and the README install notes.

### Automated

- `npm test`: 23/23 tests pass, including the new
  `anonga:data-changed` dispatch test.
- `npm run build`: production bundle builds cleanly.
- Release APK manifest verified with `aapt2`: `allowBackup=true`,
  `hasFragileUserData=true`, `requestLegacyExternalStorage=true`,
  `WRITE_EXTERNAL_STORAGE` limited to API 29.

### Device verified

Samsung RFCY30E0LRT. Debug-signed v1.6 installed over debug-signed v1.5 with
`adb install -r`; no data loss.

- The automatic backup file was created at
  `/sdcard/Documents/AnoNga/anonga-autosave.json` (49,659 bytes).
- Parsed backup contents: 4 custom collections, 201 custom questions,
  `dark-cherry` theme, `appVersion 1.6`.
- Safe restore test: removed only `anonga_autorestore_checked`, force-stopped,
  and relaunched. The app logged `Filesystem.readFile` before deck loading and
  restored the same 4 collections, 201 questions, and `dark-cherry` theme.
- No fatal logcat errors.
- Leftover `Documents/AnoNga/test-persist.txt` deleted.

### Not verified

- A real uninstall and reinstall on the physical device. That would delete the
  user's live data and was deliberately avoided.
- Release-signed `AnoNga-1.6.apk` on a physical Android device.
- Reset App Data on a device, because it would erase real data.

Release APK: `AnoNga-1.6.apk`, versionCode 7, signed.
SHA-256: `51C132EA93C9F5F3E29B1DFD8DE89515DA7007C2A7352816DD7C0C71111F2C62`

## 15. v1.7 usability: CSV append, edit, resume, undo, duplicate names

### Changes

- **Import CSV into an existing collection.** The deck-info screen now has an
  **Import CSV** button. The import reads the file locally, skips rows that
  exactly match a question already in that deck (normalized English and
  Taglish), skips incomplete rows, and shows the add/skip counts before writing.
  Duplicates in different decks remain allowed.
- **Edit question text.** Each question in the Add Questions preview has an edit
  button. Saving updates the same question in place, keeps its id, and excludes
  that question from the duplicate check. Cancel edit restores the form.
- **Resume the last card.** Progress is saved per deck in
  `anonga_session_progress` with the question id, position, and timestamp. Opening
  a deck returns to the last card and shows a resume toast. Completing or
  restarting a deck clears its progress. Progress is device state, so it is not
  included in backups and is cleared by Reset App Data.
- **Undo delete.** Deleting a collection or a question shows a 6-second **Undo**
  action in the toast. Collection undo restores the deck, its theme, and its
  question overrides; question undo restores the removed entries at their
  original positions. Undo refuses to restore a collection name that has been
  reused in the meantime.
- **Duplicate collection names.** One case-insensitive helper, `findDeckByName`,
  now checks manual creation, CSV details, and the final write. The same check
  also covers the deck being edited by excluding its own id.
- **Shared hidden rule.** Added the missing global `.hidden` CSS rule. Search
  results, the question toolbar, and the new Cancel edit button now hide
  correctly.
- **Session refresh fix.** After adding, editing, or removing questions during
  play, the session order is rebuilt so new cards are reachable and deleted cards
  do not leave stale indexes.

### Automated

- `npm test`: 23/23 tests pass.
- `npm run build`: production bundle builds cleanly.
- Release APK: `versionCode 8`, `versionName 1.7`, minSdk 22, targetSdk 34,
  signed with the existing `CN=AnoNga` certificate.

### Device verified

Samsung RFCY30E0LRT. Debug-signed v1.7 installed over debug-signed v1.6 with
`adb install -r`; no data loss. Real data remained 4 collections, 201
questions, and the `dark-cherry` theme.

- Duplicate collection name: manual create form rejected the existing name with
  the **Duplicate Deck** alert; deck count stayed 4.
- Edit question: changed the first question text, verified the stored value, then
  edited it back to the original text.
- Resume: opened a 50-question deck, advanced to card 4, went back, and reopened
  it. It resumed at card 4 of 50 with the resume toast.
- Undo question delete: deleting the last question changed the deck from 50 to 49
  and showed **Undo**; tapping Undo restored it to 50 with the same question id.
- CSV append: imported a two-row file containing one duplicate and one new
  question. The dialog reported `Add 1 question` and `1 row will be skipped`;
  after Import the deck grew from 1 to 2 questions and the toast reported
  `Imported 1 question, skipped 1.` The test question was then removed, restoring
  the deck to 1 question.
- Automatic backup: `/sdcard/Documents/AnoNga/anonga-autosave.json` is 49,659
  bytes with `appVersion 1.7` and the `dark-cherry` theme.
- No fatal logcat errors.
- Test resume progress was cleared after verification.

### Release install and manual restore

The debug-signed build was replaced by the release-signed build on the same
phone (Android 17, SDK 37) using the backup-and-restore path.

- Backup verified on the PC first: `appVersion 1.7`, 4 custom collections, 201
  questions, `custom_1793723875493` set to `dark-cherry`.
- Debug build uninstalled with `adb uninstall com.marc.anonga`; the shared
  backup files were not touched.
- `AnoNga-1.7.apk` installed with `adb install`; `versionCode 8`,
  `versionName 1.7`, signed `CN=AnoNga`.
- Automatic restore did **not** run on the fresh install (see below). The
  **Restore Backup** control in Collections → YOUR DATA was used instead. The
  file picker opened on Downloads and
  `anonga-autosave-pre-release-1.7.json` was selected.
- The confirm dialog reported `Backup from 08/11/2026, 00:17:52. 4 custom
  collections, 0 imported collections, 0 handmade questions, 0 favorites.`
  After confirming, the app reloaded with the collections restored.
- Verified after restore: `deep question` 50 questions, `healty but deep rs` 50
  questions, `Para sarili` 100 questions, `Device Test` 1 question (201 total),
  and `deep question` opens with the dark `dark-cherry` theme.
- Favorites were empty before and after; a temporary favorite used for testing
  was removed.

### Automatic backup fails on Android 17

On this phone the release build cannot write the automatic backup to
`/sdcard/Documents/AnoNga/anonga-autosave.json`; the file still has its
pre-install timestamp and size (00:17, 49,659 bytes). Saving a favorite and
restarting the app did not update it.

- The app uses the Capacitor Filesystem plugin, which writes to
  `/storage/emulated/0/Documents` through the direct file API. On Android 11+
  with `targetSdk 34` that path needs all-files access; `requestLegacyExternalStorage`
  is ignored.
- `adb shell appops get com.marc.anonga` shows `MANAGE_EXTERNAL_STORAGE: default`
  and recent `WRITE_MEDIA_*: deny` entries. The manifest declares
  `READ_MEDIA_DOCUMENTS` but never requests it, and it does not declare
  `MANAGE_EXTERNAL_STORAGE`.
- Because the read also fails, the automatic restore is skipped on a fresh
  install. The failure is silent: the app keeps working from `localStorage`, so
  new changes are not copied to shared storage.
- Workaround: **Back Up Data** still works because it uses the Android share
  sheet, and **Restore Backup** works through the system file picker. Both were
  used successfully on the release build.

### Not verified

- Reset App Data on a device, because it would erase real data.
- Automatic backup on Android 11+ until the storage-access fix is shipped.

Release APK: `AnoNga-1.7.apk`, versionCode 8, signed.
SHA-256: `124F6E0C4498AF8D856A2B52B54504FF3C7F1AB77AE85334700FA1286F6ED42A`

## 16. v1.8 storage access: automatic backup and restore on Android 11+

### Cause

The Capacitor Filesystem plugin reads and writes `Documents/AnoNga` through the
direct file API. On Android 11 and newer with `targetSdk 34`, that path needs
`MANAGE_EXTERNAL_STORAGE` ("All files access"). The manifest declared
`READ_MEDIA_DOCUMENTS` but never requested it, and `requestLegacyExternalStorage`
is ignored on these versions. On the test phone (Android 17, SDK 37) every write
was denied, so the automatic backup stayed stale and the automatic restore was
skipped. The failure was only logged to the WebView console, which release
builds do not expose.

### Changes

- **Native storage-access plugin.** `StorageAccessPlugin.java` reports whether
  the app has all-files access and opens the system
  `ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION` screen for AnoNga. It is
  registered from `MainActivity`.
- **Permission declared.** `AndroidManifest.xml` now declares
  `MANAGE_EXTERNAL_STORAGE`.
- **In-app prompt.** On Android 11+, if access is missing, the app shows its own
  **Allow file access?** modal after the home screen renders. **Open settings**
  jumps to the system toggle; **Not now** dismisses it for the session. No native
  dialog is used.
- **Retry on return.** When the app comes back to the foreground with access
  granted, it restores a pending backup (page reload) or writes the automatic
  backup immediately.
- **Stale-backup guard.** Automatic restore now runs only when this install has
  no user data yet, and the manual **Restore Backup** flow sets the restore
  marker. An old shared backup can no longer overwrite newer local data.
- **Version** `versionCode 9`, `versionName 1.8`.

### Automated

- `npm test`: 23/23 tests pass.
- `npm run build`: production bundle builds cleanly.
- Release APK signed with the existing `CN=AnoNga` certificate.

### Device verified

Samsung RFCY30E0LRT, Android 17 (SDK 37). Installed over v1.7 with the same
release signature; real data was kept.

- Upgrade launch showed the **Allow file access?** modal. **Open settings**
  opened **All files access** for `AnoNga? Version 1.8`.
- After allowing access, the automatic backup was written immediately:
  `/sdcard/Documents/AnoNga/anonga-autosave.json` became 49,659 bytes with
  `appVersion 1.8`, 4 collections, 201 questions, `dark-cherry`, 0 favorites.
- Favorite toggle test: saving a favorite rewrote the backup (49,877 bytes);
  removing it rewrote it again to 49,659 bytes with 0 favorites.
- Fresh-install restore test: the v1.8 APK was uninstalled, then installed
  again. The first launch showed the access modal; after granting access, the
  app restored the backup automatically and showed the 4 collections with 201
  questions and the `dark-cherry` theme. The **Restore Backup** picker was not
  used.
- Relaunch with access already granted: no modal, data intact, no fatal logcat
  errors.
- Backups kept during testing: `Documents/AnoNga/anonga-autosave.json`,
  `Download/anonga-autosave-before-1.8-test.json`, and the PC copies.

### Not verified

- Reset App Data on a device, because it would erase real data.
- Devices below Android 11, where the access prompt is skipped by design.
- The system settings screen wording on other Android versions.

Release APK: `AnoNga-1.8.apk`, versionCode 9, signed.
SHA-256: `E66DFE3697717AE19E7BAB708A6503C482737F33DE86C42EA838071348162E92`

## 17. v1.9 collection controls: mix decks, reorder, move questions

### Changes

- **Mix Decks.** The Collections tab has a **Mix Decks** button. It lists every
  deck with questions, requires at least two selections, and starts one session
  from a synthetic `isMix` deck that copies the chosen questions. The session
  starts shuffled, never writes session progress, and never resumes, so the
  normal resume points of the real decks stay untouched. The play-screen
  **Info** button is hidden for a mixed deck because there is no collection
  record to edit.
- **Reorder.** Every row in **Add Questions** now has up and down chevrons. The
  swap is saved through `saveDeckQuestions`; a failed write restores the old
  order and shows the save-failure modal.
- **Move selected.** A **Move selected** button sits next to **Delete selected**.
  It opens a picker of all other decks, copies the selected questions with new
  ids, and removes them from the source. Exact duplicates (normalized English and
  Taglish) already in the target are skipped and reported in the toast. The
  target deck is written before the source, so a partial failure leaves the
  question in both decks instead of losing it.
- **Duplicate rule.** Duplicates are blocked only inside one deck; the same
  question may exist in two decks.
- **Version** `versionCode 10`, `versionName 1.9`.

### Automated

- `npm test`: 23/23 tests pass.
- `npm run build`: production bundle builds cleanly; `npx cap sync android`
  copies it into the Android project.
- Temporary jsdom smoke test (since deleted) drove the real app module:
  - Mixing two seeded decks produced a 5-card session, hid **Info**, and left
    `anonga_session_progress` unset.
  - A down-chevron click persisted the new question order to
    `anonga_custom_decks`.
  - Moving two selected questions left the source with 1 question and the target
    with 4.
- Release APK signed with the existing `CN=AnoNga` certificate.

### Emulator verified

Pixel-class AVD `Medium_Phone_API_37.0`, Android 17 (SDK 37), built-in decks
only. The release APK was installed fresh.

- Collections tab showed **Create New Collection** and **Mix Decks**.
- **Mix Decks** listed the decks with counts; two selections enabled
  **Start mixed session (2)**. The session title was
  `Getting to Know + In a Relationship`, the counter `1 / 120`, and the play
  screen had no **Info** button.
- Deck info for a built-in deck still showed **Edit Details**.
- **Add Questions** showed the up/down chevrons plus **Move selected** and
  **Delete selected**. A down-chevron click reordered the list.
- Moving one selected question to **In a Relationship** showed
  `Moved 1 question to "In a Relationship".` and the source count dropped to 59.
- After a force-stop and relaunch: **Getting to Know** still listed 59 questions
  and **In a Relationship** 61, and the reordered question was still the first
  card of **Getting to Know** (`1 / 59`). No fatal logcat errors.

### Not verified

- The physical phone was disconnected during this release, so the v1.9 upgrade
  over real data (4 collections, 201 questions, `dark-cherry`) is still pending.
  No storage was cleared or reset during testing; all existing backups remain.
- Mix Decks with the user's own collections, and moving questions between them,
  which the emulator has no data for.

Release APK: `AnoNga-1.9.apk`, versionCode 10, signed.
SHA-256: `37F91990BAD84903A5880468F94EFB767AB00804E0E7B6265C033D4179A5E984`

## 18. v1.10 settings and dark mode

### Changes

- **Settings screen.** A gear button in the home header opens the app's own
  Settings modal. No native dialogs are used.
- **Appearance.** Light, Dark, or System. The choice is stored under
  `anonga_appearance` and applied as `data-appearance` on the document element,
  so every screen, modal, toast, and picker restyles from one token set. System
  follows `prefers-color-scheme` and updates live when the phone switches.
- **Dark tokens.** Dark mode overrides the shared surface tokens (background,
  card background, ink, borders, shadows) and the remaining hard-coded light
  surfaces: header, collection tiles, theme options, question rows, pickers,
  search clear, dividers, and muted text. The Android theme-color meta tag is
  updated to match.
- **Card language.** English or Taglish can be chosen in Settings. It uses the
  existing `anonga_language` key, so the header toggle and the play-screen toggle
  stay in sync, and the card re-renders if a session is open.
- **Shuffle when a deck opens.** Stored under `anonga_shuffle_on_open`. When on,
  `startDeckSession` shuffles the order even when the caller did not ask for it.
  Resume still works because progress is matched by question id.
- **Resume where you stopped.** Stored under `anonga_resume_on_open`, default on.
  When off, a deck opens at the first card and saved progress is ignored.
- Settings are device state, not user content, so they are not written to the
  backup and are not restored from it.
- **Version** `versionCode 11`, `versionName 1.10`.

### Automated

- `npm test`: 23/23 tests pass.
- `npm run build`: production bundle builds cleanly; `npx cap sync android`
  copies it into the Android project.
- Temporary jsdom smoke test (since deleted) drove the real app module:
  - The gear opened Settings; choosing **Dark** set
    `documentElement.dataset.appearance = "dark"`, stored
    `anonga_appearance=dark`, updated the theme-color meta tag, and marked the
    choice active. Choosing **Light** reverted both.
  - Choosing **Taglish** stored `anonga_language=tl` and changed the header
    toggle to `TL / EN`.
  - Both switches persisted `true` / `false` and the modal closed.
  - With resume off, a deck with saved progress at card 3 opened at `1 / 5`;
    with resume on it reopened at `3 / 5`.
- Release APK signed with the existing `CN=AnoNga` certificate.

### Emulator verified

Pixel-class AVD `Medium_Phone_API_37.0`, Android 17 (SDK 37), built-in decks
only.

- The gear appeared in the header next to **EN / TL** and opened Settings.
- **Dark** repainted the home screen, tab bar, search box, collection tiles,
  deck cards, and the Settings modal; **Light** restored the warm palette.
- **System** followed the emulator's light/dark setting.
- Settings choices showed the active state and survived a force-stop/relaunch.
- The card language choice and both switches survived a relaunch.
- No fatal logcat errors.

### Physical phone verified

Samsung SM-A366B, Android 14 (target SDK 34), upgraded in place from v1.8
(versionCode 9) to v1.10 (versionCode 11) with `adb install -r`.

- The install kept the app data and the all-files access grant
  (`appops get ... MANAGE_EXTERNAL_STORAGE` = allow), so no access prompt
  appeared and the automatic backup kept running.
- Home, tab bar, search box, collection tiles, Collections screen, and the
  Settings modal all rendered in dark mode; the phone was in dark mode and
  **System** was the active appearance.
- All 4 custom collections were present with 201 questions total:
  `Device Test` 1, `deep question` 50, `healty but deep rs` 50,
  `Para sarili` 100.
- The `deep question` deck kept its **Dark Cherry** theme badge and the play
  screen used the dark-cherry palette. It resumed at `5 / 50`, so saved progress
  survived the upgrade.
- Settings showed `AnoNga 1.10`, English card language, shuffle off, resume on.
- The automatic backup was rewritten after launch with `appVersion 1.10` and the
  same 4 collections / 201 questions / `dark-cherry` theme.
- No `FATAL EXCEPTION` or ANR in logcat.

### Not verified

- Dark mode contrast on every deck theme, because deck card themes keep their
  own palettes by design.
- The v1.9 features on the phone, because the phone skipped v1.9 and upgraded
  from v1.8 straight to v1.10.

Release APK: `AnoNga-1.10.apk`, versionCode 11, signed.
SHA-256: `8107475A6321A69B39BDF50CA3CBB9AA1A59DFD530EDB5E5E541C59175699526`

## 19. v1.10.1 layout fixes

### Confirmed issues

- **Restore Backup was clipped.** In the Collections tab, the Your Data row put
  **Back Up Data** and **Restore Backup** in a two-column grid. `.btn` uses
  `white-space: nowrap`, and grid items default to `min-width: auto`, so the
  longer label forced the row wider than the screen. The right button ran past
  the screen edge and its text was cut off.
- **Create New Collection and Mix Decks touched.** `.collections-footer` stacked
  the two buttons with no gap, so their rounded corners overlapped visually.

### Fixes

- `.data-actions .btn` is now a flex row with `min-width: 0`, a 13px label,
  wrapping text and a 6px icon gap. Labels stay inside the button at any width.
- `.data-reset-btn` also allows wrapping.
- `.collections-footer` is a flex column with a 12px gap.
- `.btn-large` gets `min-width: 0`, wrapping text and balanced line breaks.
- No JavaScript, storage, or data changes. Existing data and settings are
  untouched.

### Verified

- `npm test`: 23/23 tests pass.
- `npm run build` and `npx cap sync android`: clean.
- Samsung SM-A366B, in place over v1.10: both Your Data buttons fit inside the
  screen, and the two collection buttons have a visible gap.
- Settings still opened with **System** and **English**, and the automatic
  backup was rewritten with `appVersion 1.10.1`, 4 collections, 201 questions,
  and the `dark-cherry` theme.

### Not verified

- Light-mode screenshot of the fixed row, because the phone was in dark mode.
  The rules are appearance-independent.

Release APK: `AnoNga-1.10.1.apk`, versionCode 12, signed.
SHA-256: `91C36921D71B91960598AFFF97583965D07CE48CA81F64089651EF629C2B86E9`

