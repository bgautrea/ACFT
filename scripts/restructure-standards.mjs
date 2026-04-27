import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const EVENT_MAP = {
  'max-dead-lift': 'MDL',
  'standing-power-throw': 'SPT',
  'hand-release-push-ups': 'HRP',
  'sprint-drag-carry': 'SDC',
  'plank': 'PLK',
  'two-mile-run': 'TMR',
};

const SEX_MAP = { male: 'M', female: 'F' };

const src = JSON.parse(readFileSync('/tmp/standards-old.json', 'utf8'));
const out = {
  __meta__: {
    source: 'DA Pam 600-21, FY24 update',
    version: '2024-09-01',
    note: 'Verify against current Army standards before deployment.',
  },
};

for (const [oldSex, events] of Object.entries(src)) {
  const sex = SEX_MAP[oldSex];
  if (!sex) throw new Error(`Unknown sex key: ${oldSex}`);
  out[sex] = {};
  for (const [oldEvent, rows] of Object.entries(events)) {
    const event = EVENT_MAP[oldEvent];
    if (!event) throw new Error(`Unknown event key: ${oldEvent}`);
    out[sex][event] = {};
    for (const [rawKey, ageMapArr] of Object.entries(rows)) {
      if (!Array.isArray(ageMapArr) || ageMapArr.length !== 1) {
        throw new Error(`Expected 1-element array for ${sex}/${event}/${rawKey}`);
      }
      out[sex][event][rawKey] = ageMapArr[0];
    }
  }
}

mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/standards.json', JSON.stringify(out, null, 2) + '\n');
console.log('Wrote src/data/standards.json');
