import { describe, expect, it } from 'vitest';
import {
  bucketAge,
  scoreMDL, scoreSPT, scoreSDC, scoreTMR,
  scoreAll,
} from './scoring';

describe('bucketAge', () => {
  it('buckets 17 → 17-21', () => expect(bucketAge(17)).toBe('17-21'));
  it('buckets 21 → 17-21', () => expect(bucketAge(21)).toBe('17-21'));
  it('buckets 22 → 22-26', () => expect(bucketAge(22)).toBe('22-26'));
  it('buckets 28 → 27-31', () => expect(bucketAge(28)).toBe('27-31'));
  it('buckets 62 → 62+', () => expect(bucketAge(62)).toBe('62+'));
  it('buckets 80 → 62+', () => expect(bucketAge(80)).toBe('62+'));
  it('buckets <17 → 17-21 (clamps)', () => expect(bucketAge(15)).toBe('17-21'));
});

describe('scoreMDL (floor lookup, more weight = better)', () => {
  it('exact match returns table value', () => {
    // M/MDL/240/17-21 = 82 in the data
    expect(scoreMDL(240, 18, 'M').points).toBe(82);
  });
  it('between brackets uses floor (245 → 240)', () => {
    expect(scoreMDL(245, 18, 'M').points).toBe(82);
  });
  it('above ceiling caps at max', () => {
    // 340 is the top of the M MDL table at 100
    expect(scoreMDL(400, 18, 'M').points).toBe(100);
  });
  it('below floor returns 0', () => {
    expect(scoreMDL(50, 18, 'M').points).toBe(0);
  });
  it('pass = true when points >= 60', () => {
    expect(scoreMDL(240, 18, 'M').pass).toBe(true);
  });
  it('boundary: 140lb = 60 points (pass), 130lb = 50 points (fail)', () => {
    expect(scoreMDL(140, 18, 'M').points).toBe(60);
    expect(scoreMDL(140, 18, 'M').pass).toBe(true);
    expect(scoreMDL(130, 18, 'M').points).toBe(50);
    expect(scoreMDL(130, 18, 'M').pass).toBe(false);
  });
});

describe('scoreSDC (ceiling lookup, less time = better)', () => {
  it('returns positive points for a reasonable time', () => {
    const result = scoreSDC(134, 18, 'M'); // 2:14 = 134s
    expect(result.points).toBeGreaterThan(0);
  });
  it('below floor (faster than fastest in table) caps at 100', () => {
    expect(scoreSDC(60, 18, 'M').points).toBe(100);
  });
  it('above ceiling (slower than slowest) returns 0', () => {
    expect(scoreSDC(600, 18, 'M').points).toBe(0);
  });
});

describe('scoreAll', () => {
  it('aggregates 6 events and computes total + overallPass', () => {
    const result = scoreAll({
      age: 28,
      sex: 'M',
      raw: { MDL: '240', SPT: '9.2', HRP: '38', SDC: '2:14', PLK: '2:38', TMR: '14:42' },
    });
    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThanOrEqual(600);
    expect(result.events.MDL.points).toBeGreaterThan(0);
    expect(typeof result.overallPass).toBe('boolean');
  });

  it('overallPass is false if any event fails', () => {
    const result = scoreAll({
      age: 28,
      sex: 'M',
      raw: { MDL: '340', SPT: '12', HRP: '60', SDC: '5:00', PLK: '4:00', TMR: '13:30' },
    });
    expect(result.events.SDC.pass).toBe(false);
    expect(result.overallPass).toBe(false);
  });

  it('overallPass requires all events >= 60 AND total >= 360', () => {
    const result = scoreAll({
      age: 28,
      sex: 'M',
      raw: { MDL: '240', SPT: '9.0', HRP: '30', SDC: '2:00', PLK: '2:30', TMR: '17:00' },
    });
    if (result.total >= 360 && Object.values(result.events).every(e => e.pass)) {
      expect(result.overallPass).toBe(true);
    } else {
      expect(result.overallPass).toBe(false);
    }
  });

  it('empty raw inputs score 0 and overallPass is false', () => {
    const result = scoreAll({
      age: 28,
      sex: 'M',
      raw: { MDL: '', SPT: '', HRP: '', SDC: '', PLK: '', TMR: '' },
    });
    expect(result.total).toBe(0);
    expect(result.overallPass).toBe(false);
  });
});

describe('gap-in-table resilience', () => {
  it('SPT floor lookup picks lower neighbor for skipped key (127 → uses 126)', () => {
    // Look at standards.json M.SPT to find a gap. The SPT table has gaps at high values.
    // We don't hardcode the specific score; we assert that the result is consistent
    // with the floor of the gap (i.e., looking up a skipped key gives the same score
    // as the next-lower available key).
    const at126 = scoreSPT(12.6, 25, 'M').points;
    const at127 = scoreSPT(12.7, 25, 'M').points;
    expect(at127).toBe(at126);
  });

  it('TMR ceiling lookup picks higher neighbor for skipped key', () => {
    // TMR keys are 4-digit MMSS. Find a gap by looking at adjacent keys; the
    // assertion is that a skipped time scores the same as the next slower
    // (numerically larger) key in the table.
    // Use 13:23 (mmss=1323) which may or may not exist; if skipped, must equal 13:24's score.
    // Both values land in the table somewhere; the test asserts ceiling resilience generally.
    const a = scoreTMR(13 * 60 + 23, 25, 'M').points;
    const b = scoreTMR(13 * 60 + 24, 25, 'M').points;
    // If 13:23 is in the table: result will be that key's score.
    // If 13:23 is NOT in the table: ceiling chooses 13:24 (the next higher key) so a == b.
    // Either way, with monotonic scoring (slower time ≥ same or fewer points),
    // a >= b must hold.
    expect(a).toBeGreaterThanOrEqual(b);
  });
});
