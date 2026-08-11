import { act, renderHook } from '@testing-library/react';

import { useRequestPasswordResetModel } from './useRequestPasswordResetModel';

const mockRequestReset = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockRequestReset],
}));

describe('useRequestPasswordResetModel', () => {
  beforeEach(() => {
    mockRequestReset.mockReset();
  });

  it('clears a previous success message before reporting a failed retry', async () => {
    mockRequestReset
      .mockResolvedValueOnce({ data: { requestPasswordReset: { accepted: true } } })
      .mockRejectedValueOnce(new Error('network details'));

    const { result } = renderHook(() => useRequestPasswordResetModel());

    act(() => result.current.form.setValue('email', 'user@example.com'));
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.sent).toBe(true);

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.sent).toBe(false);
    expect(result.current.errorMessage).toBe('errors.network');
  });
});
