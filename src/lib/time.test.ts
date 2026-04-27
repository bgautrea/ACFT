import { describe, expect, it } from 'vitest';
import { parseTime, formatTime, normalizeTimeInput } from './time';

describe('parseTime', () => {
  it('parses MM:SS', () => {
    expect(parseTime('2:14')).toBe(134);
  });
  it('parses M:SS', () => {
    expect(parseTime('1:30')).toBe(90);
  });
  it('pads short seconds (M:S → M:0S)', () => {
    expect(parseTime('2:4')).toBe(124);
  });
  it('parses bare integer as seconds', () => {
    expect(parseTime('134')).toBe(134);
  });
  it('returns 0 for empty string', () => {
    expect(parseTime('')).toBe(0);
  });
  it('returns null for non-numeric garbage', () => {
    expect(parseTime('abc')).toBeNull();
  });
  it('returns null for malformed MM:SS', () => {
    expect(parseTime('2:abc')).toBeNull();
  });
  it('handles leading whitespace', () => {
    expect(parseTime('  2:14  ')).toBe(134);
  });
  it('clamps seconds >59 in MM:SS form', () => {
    expect(parseTime('2:75')).toBeNull();
  });
});

describe('formatTime', () => {
  it('formats 134 as 2:14', () => {
    expect(formatTime(134)).toBe('2:14');
  });
  it('zero-pads single-digit seconds', () => {
    expect(formatTime(125)).toBe('2:05');
  });
  it('returns 0:00 for 0', () => {
    expect(formatTime(0)).toBe('0:00');
  });
});

describe('normalizeTimeInput', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeTimeInput('')).toBe('');
  });
  it('returns empty string for non-digit only input', () => {
    expect(normalizeTimeInput('abc')).toBe('');
  });
  it('passes single digit through unchanged', () => {
    expect(normalizeTimeInput('2')).toBe('2');
  });
  it('passes two digits through unchanged', () => {
    expect(normalizeTimeInput('23')).toBe('23');
  });
  it('inserts colon after first of three digits', () => {
    expect(normalizeTimeInput('239')).toBe('2:39');
  });
  it('inserts colon after second of four digits', () => {
    expect(normalizeTimeInput('1430')).toBe('14:30');
  });
  it('caps at 4 digits, ignoring excess', () => {
    expect(normalizeTimeInput('12345')).toBe('12:34');
  });
  it('round-trips an already-formatted value', () => {
    expect(normalizeTimeInput('2:39')).toBe('2:39');
  });
  it('strips other non-digit characters', () => {
    expect(normalizeTimeInput('2 : 39')).toBe('2:39');
    expect(normalizeTimeInput('2m39s')).toBe('2:39');
  });
  it('preserves leading zero on minute when typed', () => {
    expect(normalizeTimeInput('045')).toBe('0:45');
  });
});
