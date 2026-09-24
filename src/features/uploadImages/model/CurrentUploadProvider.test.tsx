import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';

import { CurrentUploadProvider, useCurrentUpload } from './CurrentUploadProvider';
import { UploadFailedError } from './uploadToStorage';

const mockStart = jest.fn();
const mockCancel = jest.fn();
let mockUploading = false;
let mockSession: { status: string; user?: { id: string } } = { status: 'guest' };

jest.mock('./useImageUpload', () => ({
  useImageUpload: () => ({ start: mockStart, cancel: mockCancel, uploading: mockUploading }),
}));

jest.mock('entities/user', () => ({
  useCurrentUser: () => mockSession,
}));

const startedBatch = {
  batchId: 'batch-1',
  batchToken: 'token',
  sourceFiles: new Map<string, File>(),
  missingFiles: 0,
};

const Probe = () => {
  const { active, failure, submit, reset } = useCurrentUpload();

  return (
    <>
      <output>{active?.batchId ?? failure ?? 'idle'}</output>
      <button type="button" onClick={() => void submit([], 'LOSSY', 'LOW')}>
        submit
      </button>
      <button type="button" onClick={reset}>
        reset
      </button>
    </>
  );
};

const Page = () => {
  const [mounted, setMounted] = useState(true);

  return (
    <CurrentUploadProvider>
      {mounted && <Probe />}
      <button type="button" onClick={() => setMounted((value) => !value)}>
        toggle
      </button>
    </CurrentUploadProvider>
  );
};

const flush = () => act(async () => undefined);

describe('CurrentUploadProvider', () => {
  beforeEach(() => {
    mockStart.mockReset();
    mockCancel.mockReset();
    mockUploading = false;
    mockSession = { status: 'guest' };
  });

  it('keeps the started batch while the page that started it is away', async () => {
    mockStart.mockResolvedValue(startedBatch);
    render(<Page />);

    act(() => screen.getByRole('button', { name: 'submit' }).click());
    await flush();
    act(() => screen.getByRole('button', { name: 'toggle' }).click());
    act(() => screen.getByRole('button', { name: 'toggle' }).click());

    expect(screen.getByRole('status')).toHaveTextContent('batch-1');
  });

  it('records why an upload failed even if nobody was watching', async () => {
    mockStart.mockRejectedValue(new UploadFailedError('NO_FILES_ADMITTED'));
    render(<Page />);

    act(() => screen.getByRole('button', { name: 'submit' }).click());
    act(() => screen.getByRole('button', { name: 'toggle' }).click());
    await flush();
    act(() => screen.getByRole('button', { name: 'toggle' }).click());

    expect(screen.getByRole('status')).toHaveTextContent('NO_FILES_ADMITTED');
  });

  it('says nothing when the visitor cancelled the transfer', async () => {
    mockStart.mockRejectedValue(new DOMException('aborted', 'AbortError'));
    render(<Page />);

    act(() => screen.getByRole('button', { name: 'submit' }).click());
    await flush();

    expect(screen.getByRole('status')).toHaveTextContent('idle');
  });

  it('does not resurrect a batch the visitor cleared while it was still uploading', async () => {
    let release: (value: typeof startedBatch) => void = () => undefined;
    mockStart.mockReturnValue(
      new Promise<typeof startedBatch>((resolve) => {
        release = resolve;
      })
    );
    render(<Page />);

    act(() => screen.getByRole('button', { name: 'submit' }).click());
    act(() => screen.getByRole('button', { name: 'reset' }).click());
    await act(async () => release(startedBatch));

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('idle');
  });

  it('ignores a second drop while a transfer is still running', async () => {
    mockUploading = true;
    render(<Page />);

    act(() => screen.getByRole('button', { name: 'submit' }).click());
    await flush();

    expect(mockStart).not.toHaveBeenCalled();
  });

  it('drops the guest batch once someone signs in', async () => {
    mockStart.mockResolvedValue(startedBatch);
    const { rerender } = render(<Page />);

    act(() => screen.getByRole('button', { name: 'submit' }).click());
    await flush();
    expect(screen.getByRole('status')).toHaveTextContent('batch-1');

    mockSession = { status: 'authenticated', user: { id: 'user-1' } };
    rerender(<Page />);

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('idle');
  });
});
