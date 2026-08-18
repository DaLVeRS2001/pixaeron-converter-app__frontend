import { isBatchSettled, isFileWorking } from './status';

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

