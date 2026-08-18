import { hasDownload, isBatchSettled, isFileSettled, isFileWorking } from './status';

describe('isFileSettled', () => {
  it.each(['COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'] as const)(
    'settles on %s',
    (status) => {
      expect(isFileSettled(status)).toBe(true);
    }
  );

  it.each(['UPLOADING', 'READY', 'QUEUED', 'PROCESSING'] as const)(
    'keeps polling on %s',
    (status) => {
      expect(isFileSettled(status)).toBe(false);
    }
  );
});

describe('isBatchSettled', () => {
  it('treats PARTIAL as settled, because the backend only assigns it once every file is terminal', () => {
    expect(isBatchSettled('PARTIAL')).toBe(true);
  });

  it.each(['UPLOADING', 'QUEUED', 'PROCESSING'] as const)('keeps polling on %s', (status) => {
    expect(isBatchSettled(status)).toBe(false);
  });
});

describe('isFileWorking', () => {
  it('covers the two states that justify a progress indicator', () => {
    expect(isFileWorking('QUEUED')).toBe(true);
    expect(isFileWorking('PROCESSING')).toBe(true);
    expect(isFileWorking('READY')).toBe(false);
    expect(isFileWorking('COMPLETED')).toBe(false);
  });
});

describe('hasDownload', () => {
  it('requires both a completed status and a minted url', () => {
    expect(hasDownload({ status: 'COMPLETED', downloadUrl: 'https://example.test/a' })).toBe(
      true
    );
    expect(hasDownload({ status: 'COMPLETED', downloadUrl: null })).toBe(false);
    expect(hasDownload({ status: 'PROCESSING', downloadUrl: 'https://example.test/a' })).toBe(
      false
    );
  });
});
