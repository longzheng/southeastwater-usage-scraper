import { describe, expect, it } from 'vitest';
import { convertUsageToCsv } from './csv.js';
import type { UsageData } from './auraApi.js';

describe('convertUsageToCsv', () => {
    it('converts usage data to CSV', () => {
        const usageData = [
            {
                date: new Date('2024-11-16T00:00:00'),
                localIsoString: '2024-11-16T00:00:00',
                localDateString: '2024-11-16',
                hour: 0,
                measurement: 12,
            },
        ] as const satisfies UsageData;

        expect(convertUsageToCsv(usageData[0])).toBe(
            '2024-11-16T00:00:00,2024-11-16,0,12',
        );
    });
});
