import type { ConversionBatchQuery } from 'shared/api';

type ConversionFileView = NonNullable<
  ConversionBatchQuery['conversionBatch']
>['files'][number];

export type { ConversionFileView };
