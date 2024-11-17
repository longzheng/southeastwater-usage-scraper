import type { WriteApi } from '@influxdata/influxdb-client';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import type { UsageData } from './auraApi.js';

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
    usageData: UsageData,
) {
    const points = usageData.map((usage) => {
        return new Point('water')
            .timestamp(usage.date)
            .floatField('litres', usage.measurement);
    });

    writeApi.writePoints(points);
    await writeApi.flush();
}
