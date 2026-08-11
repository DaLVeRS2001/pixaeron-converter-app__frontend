import { act, renderHook } from '@testing-library/react';

import { useRequestPasswordResetModel } from './useRequestPasswordResetModel';

const mockRequestReset = jest.fn();
let mockLanguage = 'en';

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockRequestReset],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => `${mockLanguage}:${key}` }),
}));

describe('useRequestPasswordResetModel', () => {
  beforeEach(() => {
    mockRequestReset.mockReset();
    mockLanguage = 'en';
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
    expect(result.current.error).toEqual({ code: 'NETWORK_ERROR' });
    expect(result.current.errorMessage).toBe('en:errors.network');
  });

  it('re-translates a visible error when the language changes', async () => {
    mockRequestReset.mockRejectedValueOnce(new Error('network details'));

    const { rerender, result } = renderHook(() => useRequestPasswordResetModel());

    act(() => result.current.form.setValue('email', 'user@example.com'));
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.errorMessage).toBe('en:errors.network');

    mockLanguage = 'ru';
    rerender();

    expect(result.current.errorMessage).toBe('ru:errors.network');
  });
});
