import { saveResult } from './saveResult';

const savedNames: string[] = [];
const fetchMock = jest.fn();

describe('saveResult', () => {
  beforeEach(() => {
    savedNames.length = 0;
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    global.URL.createObjectURL = jest.fn(() => 'blob:result');
    global.URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(
      this: HTMLAnchorElement
    ) {
      savedNames.push(this.download);
    });
    fetchMock.mockResolvedValue({ ok: true, blob: async () => new Blob(['bytes']) });
  });

  it('saves under the name the visitor recognises, with the real output extension', async () => {
    await saveResult('https://bucket.test/output', 'coastal-sunset-hdr.png', 'webp');

    expect(fetchMock).toHaveBeenCalledWith('https://bucket.test/output');
    expect(savedNames).toEqual(['coastal-sunset-hdr-compressed.webp']);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:result');
  });

  it('normalises jpeg to the extension people expect', async () => {
    await saveResult('https://bucket.test/output', 'photo.JPG', 'jpeg');

    expect(savedNames).toEqual(['photo-compressed.jpg']);
  });

  it('survives a name without an extension', async () => {
    await saveResult('https://bucket.test/output', 'scan', 'png');

    expect(savedNames).toEqual(['scan-compressed.png']);
  });

  it('does not invent an extension when the backend reported none', async () => {
    await saveResult('https://bucket.test/output', 'a.png', null);

    expect(savedNames).toEqual(['a-compressed.img']);
  });

  it('raises when the presigned url has expired, instead of saving an error page', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(saveResult('https://bucket.test/output', 'a.png', 'webp')).rejects.toThrow(
      '403'
    );
  });
});
