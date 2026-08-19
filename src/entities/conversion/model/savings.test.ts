import { formatBytes, savedPercent, totalSavings } from './savings';

describe('formatBytes', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1024, '1.0 KB'],
    [49645, '48.5 KB'],
    [5 * 1024 * 1024, '5.0 MB'],
    [157286400, '150 MB'],
  ])('formats %i as %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });

  it('returns an empty string rather than NaN for unusable input', () => {
    expect(formatBytes(Number.NaN)).toBe('');
    expect(formatBytes(-1)).toBe('');
  });
});

describe('savedPercent', () => {
  it('reports the reduction of a real production conversion', () => {
    expect(savedPercent(49645, 19400)).toBe(61);
  });

  it('reports zero rather than a negative saving when the output grew', () => {
    expect(savedPercent(1000, 1200)).toBe(0);
    expect(savedPercent(1000, 1000)).toBe(0);
  });

  it('refuses to divide by an unmeasured input', () => {
    expect(savedPercent(0, 100)).toBeNull();
    expect(savedPercent(Number.NaN, 100)).toBeNull();
  });
});

describe('totalSavings', () => {
  it('sums only files that carry both measurements', () => {
    const totals = totalSavings([
      { inputBytes: 4200000, outputBytes: 1800000 },
      { inputBytes: 3100000, outputBytes: 980000 },
      { inputBytes: null, outputBytes: null },
      { inputBytes: 2800000 },
    ]);

    expect(totals.files).toBe(2);
    expect(totals.inputBytes).toBe(7300000);
    expect(totals.outputBytes).toBe(2780000);
    expect(totals.savedBytes).toBe(4520000);
    expect(totals.savedPercent).toBe(62);
  });

  it('never reports a negative total when every output grew', () => {
    const totals = totalSavings([{ inputBytes: 100, outputBytes: 140 }]);

    expect(totals.savedBytes).toBe(0);
    expect(totals.savedPercent).toBe(0);
  });

  it('returns zeroes for an empty selection', () => {
    expect(totalSavings([])).toEqual({
      files: 0,
      inputBytes: 0,
      outputBytes: 0,
      savedBytes: 0,
      savedPercent: 0,
    });
  });
});
