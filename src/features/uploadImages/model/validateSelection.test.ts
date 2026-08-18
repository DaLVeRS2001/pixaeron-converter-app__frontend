import { SELECTION_REJECTION, validateSelection } from './validateSelection';

const image = (name: string, size: number, type = 'image/png') =>
  Object.defineProperty(new File([], name, { type }), 'size', { value: size }) as File;

const anonymousLimits = {
  maxBatchFiles: 3,
  maxFileBytes: 5 * 1024 * 1024,
  remainingToday: 10,
};

describe('validateSelection', () => {
  it('accepts the four formats the worker can encode', () => {
    const files = [
      image('a.jpg', 1000, 'image/jpeg'),
      image('b.png', 1000, 'image/png'),
      image('c.webp', 1000, 'image/webp'),
    ];

    const result = validateSelection(files, { ...anonymousLimits, maxBatchFiles: 10 });

    expect(result.accepted).toHaveLength(3);
    expect(result.rejected).toHaveLength(0);
  });

  it('rejects a type the backend would fail later', () => {
    const result = validateSelection([image('c.tiff', 1000, 'image/tiff')], anonymousLimits);

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected[0].reason).toBe(SELECTION_REJECTION.unsupportedType);
  });

  it('rejects a file above the plan size before a byte is uploaded', () => {
    const result = validateSelection([image('big.png', 6 * 1024 * 1024)], anonymousLimits);

    expect(result.rejected[0].reason).toBe(SELECTION_REJECTION.tooLarge);
  });

  it('caps the batch at the plan limit and names the surplus', () => {
    const files = [1, 2, 3, 4, 5].map((n) => image(`${n}.png`, 1000));

    const result = validateSelection(files, anonymousLimits);

    expect(result.accepted).toHaveLength(3);
    expect(result.rejected.map((entry) => entry.reason)).toEqual([
      SELECTION_REJECTION.overBatchLimit,
      SELECTION_REJECTION.overBatchLimit,
    ]);
  });

  it('caps by the remaining daily quota, which is stricter than the batch limit', () => {
    const files = [1, 2, 3].map((n) => image(`${n}.png`, 1000));

    const result = validateSelection(files, { ...anonymousLimits, remainingToday: 1 });

    expect(result.accepted).toHaveLength(1);
    expect(result.rejected.map((entry) => entry.reason)).toEqual([
      SELECTION_REJECTION.overDailyLimit,
      SELECTION_REJECTION.overDailyLimit,
    ]);
  });

  it('accepts nothing once the daily quota is spent', () => {
    const result = validateSelection([image('a.png', 1000)], {
      ...anonymousLimits,
      remainingToday: 0,
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected[0].reason).toBe(SELECTION_REJECTION.overDailyLimit);
  });

  it('treats a null daily allowance as unlimited, as paid plans report it', () => {
    const files = [1, 2, 3, 4].map((n) => image(`${n}.png`, 1000));

    const result = validateSelection(files, {
      maxBatchFiles: 20,
      maxFileBytes: 150 * 1024 * 1024,
      remainingToday: null,
    });

    expect(result.accepted).toHaveLength(4);
    expect(result.rejected).toHaveLength(0);
  });

  it('reports the first failing rule per file, so a huge unsupported file reads as unsupported', () => {
    const result = validateSelection(
      [image('x.gif', 9 * 1024 * 1024, 'image/gif')],
      anonymousLimits
    );

    expect(result.rejected[0].reason).toBe(SELECTION_REJECTION.unsupportedType);
  });
});
