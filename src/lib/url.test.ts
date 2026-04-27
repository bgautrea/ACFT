import { describe, expect, it } from 'vitest';
import { encode, decode } from './url';
import type { State } from './types';

const baseState: State = {
  age: 25,
  sex: 'M',
  raw: { MDL: '', SPT: '', HRP: '', SDC: '', PLK: '', TMR: '' },
};

describe('encode', () => {
  it('emits age and sex even when raw is all-empty', () => {
    expect(encode(baseState)).toBe('?age=25&sex=M');
  });

  it('emits lowercased event keys when raw has values', () => {
    const s: State = {
      ...baseState,
      raw: { MDL: '240', SPT: '12.5', HRP: '45', SDC: '2:00', PLK: '2:30', TMR: '15:30' },
    };
    const q = encode(s);
    expect(q).toContain('mdl=240');
    expect(q).toContain('spt=12.5');
    expect(q).toContain('hrp=45');
    expect(q).toContain('sdc=2%3A00');
    expect(q).toContain('plk=2%3A30');
    expect(q).toContain('tmr=15%3A30');
    expect(q).toContain('age=25');
    expect(q).toContain('sex=M');
    expect(q.startsWith('?')).toBe(true);
  });

  it('omits empty raw fields', () => {
    const s: State = { ...baseState, raw: { ...baseState.raw, MDL: '240' } };
    const q = encode(s);
    expect(q).toContain('mdl=240');
    expect(q).not.toContain('spt=');
    expect(q).not.toContain('hrp=');
  });

  it('treats whitespace-only raw as empty', () => {
    const s: State = { ...baseState, raw: { ...baseState.raw, MDL: '   ' } };
    expect(encode(s)).not.toContain('mdl=');
  });
});

describe('decode', () => {
  it('returns null when no recognized fields are present', () => {
    expect(decode(new URLSearchParams(''))).toBeNull();
    expect(decode(new URLSearchParams('?foo=bar'))).toBeNull();
  });

  it('parses age, sex, and lowercased event keys', () => {
    const p = decode(new URLSearchParams('age=30&sex=F&mdl=240&tmr=15:30'));
    expect(p).toEqual({
      age: 30,
      sex: 'F',
      raw: { MDL: '240', TMR: '15:30' },
    });
  });

  it('clamps age to [17, 99]', () => {
    expect(decode(new URLSearchParams('age=10'))).toEqual({ age: 17 });
    expect(decode(new URLSearchParams('age=200'))).toEqual({ age: 99 });
  });

  it('drops malformed age', () => {
    expect(decode(new URLSearchParams('age=abc&sex=M'))).toEqual({ sex: 'M' });
  });

  it('rejects sex other than exact M or F', () => {
    expect(decode(new URLSearchParams('sex=m'))).toBeNull();
    expect(decode(new URLSearchParams('sex=Q'))).toBeNull();
    expect(decode(new URLSearchParams('sex=female'))).toBeNull();
  });

  it('ignores mixed-case event keys', () => {
    expect(decode(new URLSearchParams('MDL=240'))).toBeNull();
  });

  it('caps event values at 8 chars', () => {
    const p = decode(new URLSearchParams('mdl=12345678901234'));
    expect(p?.raw?.MDL).toBe('12345678');
  });

  it('round-trips a full state', () => {
    const s: State = {
      age: 28,
      sex: 'F',
      raw: { MDL: '240', SPT: '12.5', HRP: '45', SDC: '2:00', PLK: '2:30', TMR: '15:30' },
    };
    const q = encode(s).slice(1);
    const p = decode(new URLSearchParams(q));
    expect(p).toEqual({ age: s.age, sex: s.sex, raw: s.raw });
  });
});
