import { act, renderHook } from '@testing-library/react';

import { ACTIVE_POLL_MS, HIDDEN_POLL_MS, usePollingWhile } from './usePollingWhile';

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  act(() => document.dispatchEvent(new Event('visibilitychange')));
};

describe('usePollingWhile', () => {
  const startPolling = jest.fn();
  const stopPolling = jest.fn();

  beforeEach(() => {
    startPolling.mockClear();
    stopPolling.mockClear();
    setVisibility('visible');
  });

  it('polls only while the condition holds and stops when it drops', () => {
    const { rerender } = renderHook(
      ({ active }) => usePollingWhile({ startPolling, stopPolling }, active),
      { initialProps: { active: false } }
    );

    expect(startPolling).not.toHaveBeenCalled();

    rerender({ active: true });
    expect(startPolling).toHaveBeenCalledWith(ACTIVE_POLL_MS);

    rerender({ active: false });
    expect(stopPolling).toHaveBeenCalledTimes(1);
  });

  it('slows down while the tab is in the background', () => {
    renderHook(() => usePollingWhile({ startPolling, stopPolling }, true));

    startPolling.mockClear();
    setVisibility('hidden');

    expect(startPolling).toHaveBeenCalledWith(HIDDEN_POLL_MS);
  });
});
