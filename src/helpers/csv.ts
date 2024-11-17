import type { UsageSchema } from './auraApi.js';
import { convertReadingDateToLocalDate } from './auraApi.js';
import { resetFile, appendToFile } from './file.js';

export const csvFilename = 'usage.csv';

export async function resetCsv() {
    // write headers
    await resetFile(csvFilename);

    await appendToFile(csvFilename, 'Timestamp,Date,Hour,MeasurementLitres');
}

export async function writeCsvUsageData(usageData: UsageSchema) {
    await appendToFile(
        csvFilename,
        usageData.Readings.map((reading) => convertReadingToCsv(reading)).join(
            '\n',
        ),
    );
}

function convertReadingToCsv(reading: UsageSchema['Readings'][number]): string {
    const localDate = convertReadingDateToLocalDate(reading);

    // convert date to yyyy-mm-dd
    const dateString = localDate.date.toISOString().split('T')[0];
    const hourString = localDate.date.getHours();

    return `${localDate.dateString},${dateString},${hourString},${reading.Measurement}`;
}
