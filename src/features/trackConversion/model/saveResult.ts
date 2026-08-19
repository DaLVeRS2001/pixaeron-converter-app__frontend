const DOWNLOAD_FAILURE = {
  expired: 'RESULT_EXPIRED',
  unreachable: 'STORAGE_UNREACHABLE',
} as const;

const OUTPUT_EXTENSION = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
} as const;

const saveResult = async (
  downloadUrl: string,
  originalName: string,
  outputFormat: string | null | undefined
): Promise<void> => {
  const response = await fetch(downloadUrl);
  if (!response.ok) throw new Error(`download responded ${response.status}`);

  const dot = originalName.lastIndexOf('.');
  const stem = dot > 0 ? originalName.slice(0, dot) : originalName;
  const format = outputFormat ?? '';
  const extension = Object.hasOwn(OUTPUT_EXTENSION, format)
    ? OUTPUT_EXTENSION[format as keyof typeof OUTPUT_EXTENSION]
    : 'img';

  const href = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `${stem}-compressed.${extension}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
};

export { DOWNLOAD_FAILURE, saveResult };
