import type { UsageData } from './auraApi.js';
import { resetFile, appendToFile } from './file.js';

export const csvFilename = 'usage.csv';

export async function resetCsv() {
    // write headers
    await resetFile(csvFilename);

    await appendToFile(csvFilename, 'Timestamp,Date,Hour,MeasurementLitres');
}

export async function writeCsvUsageData(usageData: UsageData) {
    await appendToFile(
        csvFilename,
        usageData.map((usage) => convertUsageToCsv(usage)).join('\n'),
    );
}

export function convertUsageToCsv(usage: UsageData[number]): string {
    return `${usage.localIsoString},${usage.localDateString},${usage.hour},${usage.measurement}`;
}
