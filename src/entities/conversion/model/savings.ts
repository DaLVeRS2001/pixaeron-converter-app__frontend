const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

const STEP = 1024;

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '';

  let value = bytes;
  let unit = 0;
  while (value >= STEP && unit < BYTE_UNITS.length - 1) {
    value /= STEP;
    unit += 1;
  }

  const decimals = unit === 0 || value >= 100 ? 0 : 1;

  return `${value.toFixed(decimals)} ${BYTE_UNITS[unit]}`;
};

const savedPercent = (
  inputBytes: number,
  outputBytes: number
): number | null => {
  if (!Number.isFinite(inputBytes) || !Number.isFinite(outputBytes)) return null;
  if (inputBytes <= 0 || outputBytes < 0) return null;
  if (outputBytes >= inputBytes) return 0;

  return Math.round(((inputBytes - outputBytes) / inputBytes) * 100);
};

type SettledFile = {
  inputBytes?: number | null;
  outputBytes?: number | null;
};

type ConversionTotals = {
  files: number;
  inputBytes: number;
  outputBytes: number;
  savedBytes: number;
  savedPercent: number;
};

const totalSavings = (files: readonly SettledFile[]): ConversionTotals => {
  const measured = files.filter(
    (file): file is { inputBytes: number; outputBytes: number } =>
      typeof file.inputBytes === 'number' &&
      typeof file.outputBytes === 'number' &&
      file.inputBytes > 0
  );

  const inputBytes = measured.reduce((sum, file) => sum + file.inputBytes, 0);
  const outputBytes = measured.reduce((sum, file) => sum + file.outputBytes, 0);
  const savedBytes = Math.max(0, inputBytes - outputBytes);

  return {
    files: measured.length,
    inputBytes,
    outputBytes,
    savedBytes,
    savedPercent: inputBytes > 0 ? Math.round((savedBytes / inputBytes) * 100) : 0,
  };
};

export { formatBytes, savedPercent, totalSavings };
export type { ConversionTotals };
