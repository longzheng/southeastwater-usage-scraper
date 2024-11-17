import type { WriteApi } from '@influxdata/influxdb-client';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import type { UsageSchema } from './auraApi.js';
import { convertReadingDateToLocalDate } from './auraApi.js';

export function getInfluxWriteApi({
    url,
    token,
    org,
    bucket,
}: {
    url: string;
    token: string;
    org: string;
    bucket: string;
}) {
    const influxDB = new InfluxDB({ url, token });
    const writeApi = influxDB.getWriteApi(org, bucket);
    return writeApi;
}

export async function writeInfluxUsageData(
    writeApi: WriteApi,
    usageData: UsageSchema,
) {
    const points = usageData.Readings.map((reading) => {
        return new Point('water')
            .timestamp(convertReadingDateToLocalDate(reading).date)
            .floatField('litres', reading.Measurement);
    });

    writeApi.writePoints(points);
    await writeApi.flush();
}
