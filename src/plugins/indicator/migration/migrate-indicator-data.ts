import type {MigrationResult, MigrationWarning} from '../../shared/migration';
import {normalizeIndicatorData} from '../normalize';
import type {IndicatorWidgetConfig, NormalizedIndicatorWidgetConfig} from '../types';

type IndicatorMigrationWarning = MigrationWarning<'indicator-content' | 'indicator-color'>;

/** Normalize configuration and collect diagnostics for an explicit migration. */
export function migrateIndicatorData(
    input: IndicatorWidgetConfig,
): MigrationResult<NormalizedIndicatorWidgetConfig, IndicatorMigrationWarning> {
    const data = normalizeIndicatorData(input);
    const warnings: IndicatorMigrationWarning[] = [];
    input.data?.forEach((item, index) => {
        if ('content' in item) {
            warnings.push({
                code: 'indicator-content',
                path: ['data', index, 'content'],
                message: 'Use value instead of content.current.',
                replacement: 'value',
                resolution: 'automatic',
            });
        }
        if ('color' in item) {
            warnings.push({
                code: 'indicator-color',
                path: ['data', index, 'color'],
                message: 'Use value.color instead of the item color.',
                replacement: 'value.color',
                resolution: 'automatic',
            });
        }
    });
    return {data, warnings};
}
