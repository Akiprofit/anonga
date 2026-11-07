import { describe, expect, it } from 'vitest';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  backupFilename,
  buildBackup,
  csvFilename,
  parseBackup,
  questionsToCsv,
  slugifyFilename,
} from '../src/features/dataTransfer.js';

const deck = {
  id: 'custom_100',
  name: 'Date Night',
  description: 'For us',
  collection: 'together',
  color: '#3d2f5c',
  questions: [
    { id: 'custom_100_q0', en: 'What made you laugh today?', tl: 'Ano ang nagpatawa sa iyo?' },
    { id: 'custom_100_q1', en: 'Where should we go?', tl: 'Saan tayo pupunta?', reflection: 'Somewhere quiet.' },
  ],
};

function sampleBackup(overrides = {}) {
  return buildBackup({
    language: 'tl',
    favorites: [{ id: 'custom_100_q0', en: 'What made you laugh today?', tl: 'Ano ang nagpatawa sa iyo?' }],
    customDecks: [deck],
    importedDecks: [],
    handmadeQuestions: [{ id: 'handmade_q0', en: 'Handmade?', tl: 'Gawa-gawa?' }],
    deckOverrides: { 'getting-to-know': [{ id: 'getting-to-know_q0', en: 'Override', tl: 'Override TL' }] },
    deckThemes: { custom_100: 'romantic' },
    appVersion: '1.2',
    now: new Date('2026-11-07T12:00:00Z'),
    ...overrides,
  });
}

describe('buildBackup', () => {
  it('writes format, version, timestamp and app version', () => {
    const backup = sampleBackup();
    expect(backup.format).toBe(BACKUP_FORMAT);
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(backup.exportedAt).toBe('2026-11-07T12:00:00.000Z');
    expect(backup.appVersion).toBe('1.2');
    expect(backup.data.language).toBe('tl');
  });
});

describe('parseBackup', () => {
  it('round-trips a backup', () => {
    const parsed = parseBackup(JSON.stringify(sampleBackup()));
    expect(parsed.ok).toBe(true);
    expect(parsed.summary).toMatchObject({
      customDecks: 1,
      importedDecks: 0,
      handmadeQuestions: 1,
      favorites: 1,
      overriddenDecks: 1,
      themes: 1,
      totalQuestions: 3,
    });
    expect(parsed.backup.data.customDecks[0].questions).toHaveLength(2);
    expect(parsed.backup.data.customDecks[0].questions[1].reflection).toBe('Somewhere quiet.');
  });

  it('rejects empty, invalid JSON and foreign files', () => {
    expect(parseBackup('').ok).toBe(false);
    expect(parseBackup('not json').ok).toBe(false);
    expect(parseBackup(JSON.stringify({ hello: 'world' })).ok).toBe(false);
    expect(parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 99, data: {} })).ok).toBe(false);
  });

  it('accepts a valid backup with no user content', () => {
    const empty = buildBackup({ now: new Date('2026-11-07T12:00:00Z') });
    const parsed = parseBackup(JSON.stringify(empty));
    expect(parsed.ok).toBe(true);
    expect(parsed.summary.totalQuestions).toBe(0);
  });

  it('remaps ids that collide with built-in decks', () => {
    const backup = sampleBackup({
      customDecks: [{ ...deck, id: 'friends' }],
    });
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.ok).toBe(true);
    expect(parsed.backup.data.customDecks[0].id).not.toBe('friends');
    expect(parsed.backup.data.customDecks[0].id.startsWith('custom_')).toBe(true);
  });

  it('keeps duplicate question text but makes question ids unique', () => {
    const backup = sampleBackup({
      customDecks: [{
        ...deck,
        questions: [
          { id: 'same', en: 'A', tl: 'A' },
          { id: 'same', en: 'B', tl: 'B' },
        ],
      }],
    });
    const parsed = parseBackup(JSON.stringify(backup));
    const ids = parsed.backup.data.customDecks[0].questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('drops questions with no text and defaults unknown collections', () => {
    const backup = sampleBackup({
      customDecks: [{
        ...deck,
        collection: 'unknown',
        questions: [{ id: 'x', en: '', tl: '' }, { id: 'y', en: 'Kept', tl: '' }],
      }],
    });
    const parsed = parseBackup(JSON.stringify(backup));
    const restored = parsed.backup.data.customDecks[0];
    expect(restored.collection).toBe('solo');
    expect(restored.questions).toHaveLength(1);
  });

  it('sanitizes favorites and ignores duplicates', () => {
    const backup = sampleBackup({
      favorites: [
        { id: 'a', en: 'A', tl: 'A' },
        { id: 'a', en: 'A again', tl: 'A again' },
        { id: '', en: 'No id', tl: 'No id' },
      ],
    });
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.backup.data.favorites).toHaveLength(1);
  });
});

describe('questionsToCsv', () => {
  it('writes a BOM, header and quoted cells', () => {
    const csv = questionsToCsv([
      { en: 'Hello, "friend"', tl: 'Kumusta', reflection: 'Line one\nLine two' },
    ]);
    expect(csv.startsWith('\uFEFFquestion_en,question_tl,reflection\r\n')).toBe(true);
    expect(csv).toContain('"Hello, ""friend"""');
    expect(csv).toContain('"Line one\nLine two"');
  });

  it('handles empty and invalid rows', () => {
    const csv = questionsToCsv([{ en: '', tl: '' }, null, { en: 'Only EN' }]);
    const lines = csv.replace('\uFEFF', '').trim().split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe('Only EN,,');
  });
});

describe('filenames', () => {
  it('slugifies deck names safely', () => {
    expect(slugifyFilename('Date Night: Us?')).toBe('date-night-us');
    expect(slugifyFilename('   ')).toBe('collection');
    expect(csvFilename('Date Night')).toBe('anonga-date-night.csv');
  });

  it('dates the backup filename', () => {
    expect(backupFilename(new Date(2026, 10, 7))).toBe('anonga-backup-2026-11-07.json');
  });
});
