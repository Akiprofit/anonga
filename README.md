<p align="center">
  <img src="docs/icon.png" alt="AnoNga app icon" width="140" />
</p>

<h1 align="center">AnoNga?</h1>

<p align="center">
  <em>A deck for every conversation.</em>
</p>

<p align="center">
  <a href="https://github.com/Akiprofit/anonga/releases/latest">
    <img alt="Download the Android APK" src="https://img.shields.io/badge/Download-Android%20APK-163D3A?style=for-the-badge&logo=android&logoColor=white" />
  </a>
  <img alt="Version 1.10.1" src="https://img.shields.io/badge/version-1.10.1-C9846F?style=for-the-badge" />
  <img alt="Offline first" src="https://img.shields.io/badge/offline-first-5A7A5C?style=for-the-badge" />
</p>

**AnoNga?** is an offline conversation-card app for couples, friends, and quiet
moments with yourself. It comes with **300 built-in questions** in **English and
Taglish**, arranged into five decks and three conversation moods: **Solo**,
**Together**, and **Friends**.

No account. No ads. No tracking. Your decks, favorites, and custom questions stay
on your device.

---

## Download

The latest signed Android APK is on the
[**Releases page**](https://github.com/Akiprofit/anonga/releases/latest).

- Android **5.1 and newer**
- Works offline
- Release build signed for installation outside the Play Store

### Install on Android

1. Download `AnoNga-1.10.1.apk` from the latest release.
2. Open the downloaded APK.
3. Allow **Install unknown apps** for the browser or file manager you used.
4. Tap **Install**.
5. If Play Protect shows a warning, choose **Install anyway** — only do this if
   you trust the source.

> **Updating:** install a newer APK over the old one. Keep the same app package
> and signing key. AnoNga also writes an automatic backup to
> `Documents/AnoNga/anonga-autosave.json`, so collections, favorites, themes,
> and handmade questions return automatically after an uninstall and reinstall.
> On Android 11 and newer, allow **All files access** when AnoNga asks; that
> permission is what lets the app read and write the backup folder.

---

## Features

### 300 questions across five decks

| Deck | Mood | Questions |
| --- | --- | --- |
| Getting to Know | Deep talks | 60 |
| In a Relationship | Couples | 60 |
| Friends | Friendship | 60 |
| Faith & Life | Reflection | 60 |
| Fun & Games | Playful | 60 |

Every question is available in **English** and **Taglish**, switchable at any
time with the **EN / TL** button.

### Conversation-card play

- Animated card stack
- Tap to flip between English and Taglish
- Shuffle the deck
- Draw the next card
- Swipe left or right to move through questions
- Progress counter and completion screen
- Favorites for questions worth coming back to

### Settings

Tap the gear in the header.

- **Appearance:** Light, Dark, or System (follows the phone)
- **Card language:** English or Taglish as the default card side
- **Shuffle when a deck opens:** start every session in a random order
- **Resume where you stopped:** reopen a deck at the last card you saw

Settings are stored on the device and are not part of the backup. Backup,
restore, and reset stay in the Collections tab.

### Search decks and questions

Use the search box on the Decks tab to filter collections by name or
description, and to find questions in English or Taglish. Tap a question result
to open that collection at the matching card.

### Collections

- Create your own collection with a name, description, and category
- Categories: **Solo**, **Together**, or **Friends**
- Edit a collection's name, description, category, and color after creating it
- Add questions manually
- Edit any question's English and Taglish text in place
- Reorder questions with the up and down buttons
- Select one or more questions and move them to another collection
- Select one or more questions and delete them together after a confirmation
- Undo a deleted collection or question for a few seconds
- Import questions from a CSV file
- Append questions from a CSV file to an existing collection
- Choose from **16 collection colors** in a live preview
- Custom confirmation modal before deleting a collection
- Resume a collection at the card where you stopped
- Collections and their questions persist after restarting the app

### Mix decks

Choose **Mix Decks** in the Collections tab, tick two or more collections,
and play their questions as one shuffled session. A mixed session is not saved
as progress, so your normal resume points stay untouched. Questions keep their
own favorites.

### CSV import and export

Use a simple two-column CSV:

```csv
question_en,question_tl
What is your favorite color?,Ano ang iyong paboritong kulay?
Where do you see yourself in 5 years?,Saan mo makikita ang iyong sarili sa loob ng 5 taon?
```

A ready-to-use file is included at
[`samples/sample-import.csv`](samples/sample-import.csv).

The importer supports quoted fields, commas inside questions, and line breaks
inside quoted fields. Duplicates inside one import are skipped. The same
question may live in more than one collection; an exact duplicate inside the
same collection is blocked.

Open any collection, choose **Import CSV**, and its questions are appended to
that collection. Rows that already exist in the collection (same English and
Taglish text, ignoring case and surrounding spaces) are skipped, and the
confirmation shows how many will be added and skipped.

Export any collection from its details screen with **Export CSV**. The exported
file keeps the English question, Taglish question, and reflection columns, and
opens correctly in Excel and Google Sheets.

### Backup, restore, and reset

The **YOUR DATA** section in the Collections tab keeps your data portable:

- **Back Up Data** saves a JSON backup of your language, favorites, custom and
  imported collections, handmade questions, edited questions, and deck themes.
  On Android the backup opens in the share sheet so you can save it to Files,
  Drive, or send it to yourself.
- **Restore Backup** reads a backup file, shows what it contains, and asks for
  confirmation before replacing the data on this device.
- **Reset App Data** deletes local collections, favorites, themes, and added
  questions after you type `DELETE` to confirm. Built-in decks remain.

Resume position is device state, not content: it is not included in backups,
and it is cleared by **Reset App Data**.

Back up before changing phones or clearing app storage.

### Card themes

Choose from **17 card themes**, including:

Friendly · Romantic · Funny · Deep Talk · Minimal · Pastel · Dark & Elegant ·
Ocean · Sage · Sunset · Lavender · Berry · Citrus · Classic Maroon ·
Wine Burgundy · Dusty Rosewood · Dark Cherry

Themes are applied per deck and remembered between sessions.

### Designed for Android

- Responsive, mobile-first layout
- Safe-area and keyboard-aware modals
- Touch-friendly controls and swipe gestures
- Custom in-app modals and toasts instead of native browser dialogs
- Adaptive Android launcher icon that fits circular, rounded, and squircle masks
- System Back button support

### Private by default

- No account or sign-in
- No ads or analytics
- No server calls for your content
- Questions, favorites, and collections are stored in local storage on the device
- CSV files are read locally through the in-app file picker

---

## Tech stack

- **HTML, CSS, and vanilla JavaScript**
- **Vite** for building the web app
- **Capacitor 6** for the Android wrapper
- **Android SDK 34** (`minSdk 22`)
- Local storage for persistence
- `@capacitor/filesystem` and `@capacitor/share` for native backup and CSV export

---

## Run locally

Requirements: Node.js, npm, and a modern browser.

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

To build the production web bundle:

```bash
npm run build
```

The output is written to `dist/`.

---

## Build the Android app

Requirements:

- Android Studio or the Android SDK
- JDK 17
- A connected Android device or emulator

```bash
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release build

Release signing is configured through `android/keystore.properties`, which is
intentionally excluded from Git along with the keystore file.

```properties
storeFile=../anonga-release.jks
storePassword=YOUR_PASSWORD
keyAlias=anonga
keyPassword=YOUR_PASSWORD
```

Then build:

```bash
cd android
./gradlew assembleRelease -x lintVitalRelease
```

The signed APK is written to:

```text
android/app/build/outputs/apk/release/app-release.apk
```

> Keep the keystore and passwords backed up. Losing them means you cannot publish
> updates that install over the existing app.

---

## Project structure

```text
.
├── index.html                  # App screens and modal markup
├── src/
│   ├── features/
│   │   ├── app.js              # Sessions, collections, import, themes, dialogs
│   │   ├── cardThemes.js       # Card theme definitions and persistence
│   │   ├── dataTransfer.js     # Backup, restore, and CSV export helpers
│   │   └── storage.js          # Local storage helpers
│   ├── data/questions.js       # 300 built-in English/Taglish questions
│   ├── style.css               # Layout, themes, modals, responsive styles
│   └── main.js                 # App entry point
├── samples/                    # Example CSV files
├── android/                    # Capacitor Android project
└── docs/icon.png               # App icon used by this README
```

---

## Status

**v1.10.1** — Layout fixes. The **Restore Backup** button in the Your Data
section no longer overflows the screen edge on narrow phones; backup and restore
labels wrap inside their buttons. **Create New Collection** and **Mix Decks**
now have a clear gap instead of touching.

**v1.10** — Settings and dark mode. A gear in the header opens Settings with
**Light / Dark / System** appearance, default card language, shuffle-on-open,
and resume-on-open. Builds on v1.9's mix decks, reorder, and move questions,
v1.8's Android 11+ storage-access fix, v1.7's CSV append, question editing,
resume, and undo, v1.6's automatic backup and restore, v1.5's card text
auto-fit, v1.3's search and bulk question deletion, plus v1.2's JSON backup,
per-collection CSV export, and typed-confirmation reset control. The app stays
local-first and does not require an internet connection for normal use. See
[`AUDIT_REPORT.md`](AUDIT_REPORT.md) for the confirmed issues, fixes, browser
test results, and the remaining on-device checks.

Built with care for slow evenings, long drives, and conversations that deserve
better questions.
