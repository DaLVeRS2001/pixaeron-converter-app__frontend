const extensionFor = (outputFormat: string | null | undefined): string => {
  switch (outputFormat) {
    case 'jpeg':
      return 'jpg';
    case 'png':
    case 'webp':
    case 'avif':
      return outputFormat;
    default:
      return 'img';
  }
};

const compressedName = (
  originalName: string,
  outputFormat: string | null | undefined
): string => {
  const dot = originalName.lastIndexOf('.');
  const stem = dot > 0 ? originalName.slice(0, dot) : originalName;

  return `${stem}-compressed.${extensionFor(outputFormat)}`;
};

const saveBlobAs = (blob: Blob, fileName: string) => {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
};

const saveResult = async (downloadUrl: string, fileName: string): Promise<void> => {
  const response = await fetch(downloadUrl);
  if (!response.ok) throw new Error(`download responded ${response.status}`);

  saveBlobAs(await response.blob(), fileName);
};

export { compressedName, saveResult };
