import { UsageSchema } from "./auraApi";
import { resetFile, appendToFile } from "./file";

const csvFilename = "usage.csv";

export async function resetCsv() {
    // write headers
    await resetFile(csvFilename);

    await appendToFile(csvFilename, "Timestamp,Date,Hour,MeasurementLitres");
}

export async function writeCsvUsageData(usageData: UsageSchema) {
    await appendToFile(
        csvFilename,
        usageData.Readings.map((reading) => convertReadingToCsv(reading)).join(
            "\n",
        ),
    );
}

function convertReadingToCsv(reading: UsageSchema["Readings"][number]): string {
    // trim the last Z character since the timezone is local
    const localDateString = reading.Date.substring(0, reading.Date.length - 1);

    const localDate = new Date(localDateString);

    // convert date to yyyy-mm-dd
    const date = localDate.toISOString().split("T")[0];
    const hour = localDate.getHours();

    return `${localDateString},${date},${hour},${reading.Measurement}`;
}
