import { compressedName, saveResult } from './saveResult';

describe('compressedName', () => {
  it('keeps the stem the visitor recognises and adds the real output extension', () => {
    expect(compressedName('coastal-sunset-hdr.png', 'webp')).toBe(
      'coastal-sunset-hdr-compressed.webp'
    );
  });

  it('normalises jpeg to the extension people expect', () => {
    expect(compressedName('photo.JPG', 'jpeg')).toBe('photo-compressed.jpg');
  });

  it('survives a name without an extension', () => {
    expect(compressedName('scan', 'png')).toBe('scan-compressed.png');
  });

  it('does not invent an extension when the backend reported none', () => {
    expect(compressedName('a.png', null)).toBe('a-compressed.img');
  });
});

describe('saveResult', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    global.URL.createObjectURL = jest.fn(() => 'blob:result');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('fetches the object and saves it under the given name', async () => {
    const blob = new Blob(['bytes']);
    fetchMock.mockResolvedValue({ ok: true, blob: async () => blob });
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    await saveResult('https://bucket.test/output', 'photo-compressed.webp');

    expect(fetchMock).toHaveBeenCalledWith('https://bucket.test/output');
    expect(click).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:result');
    click.mockRestore();
  });

  it('raises when the presigned url has expired, instead of saving an error page', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(saveResult('https://bucket.test/output', 'a.webp')).rejects.toThrow('403');
  });
});
