import { isBatchSettled, isFileMoving } from './status';

describe('isBatchSettled', () => {
  it('treats PARTIAL as settled, because the backend only assigns it once every file is terminal', () => {
    expect(isBatchSettled('PARTIAL')).toBe(true);
  });

  it.each(['UPLOADING', 'QUEUED', 'PROCESSING'] as const)('keeps polling on %s', (status) => {
    expect(isBatchSettled(status)).toBe(false);
  });
});

describe('isFileMoving', () => {
  it.each(['READY', 'QUEUED', 'PROCESSING'] as const)(
    'keeps the tracker alive on %s, a state the file still leaves on its own',
    (status) => {
      expect(isFileMoving(status)).toBe(true);
    }
  );

  it('excludes UPLOADING, because after admission that file will never move again', () => {
    expect(isFileMoving('UPLOADING')).toBe(false);
  });

  it.each(['COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'] as const)(
    'lets the tracker stop on %s',
    (status) => {
      expect(isFileMoving(status)).toBe(false);
    }
  );
});
