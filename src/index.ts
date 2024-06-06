import "dotenv/config";
import { getSouthEastWaterUsage } from "./helpers/southEastWater";
import { csvFilename, resetCsv, writeCsvUsageData } from "./helpers/csv";
import { WriteApi } from "@influxdata/influxdb-client";
import { getInfluxWriteApi, writeInfluxUsageData } from "./helpers/influx";

const email = process.env.EMAIL;

if (!email) {
    throw new Error("EMAIL environment variable is not set");
}

const password = process.env.PASSWORD;

if (!password) {
    throw new Error("EMAIL environment variable is not set");
}

const daysToExtract = Number.parseInt(process.env.DAYS_TO_EXTRACT);

if (!daysToExtract) {
    throw new Error("DAYS_TO_EXTRACT environment variable is not set");
}

const influxWriteApi = ((): WriteApi | null => {
    const influxDbUrl = process.env.INFLUXDB_URL;
    const influxDbToken = process.env.INFLUXDB_TOKEN;
    const influxDbOrg = process.env.INFLUXDB_ORG;
    const influxDbBucket = process.env.INFLUXDB_BUCKET;

    if (!influxDbUrl) {
        return null;
    }

    if (!influxDbToken) {
        throw new Error("INFLUXDB_TOKEN environment variable is not set");
    }

    if (!influxDbOrg) {
        throw new Error("INFLUXDB_ORG environment variable is not set");
    }

    if (!influxDbBucket) {
        throw new Error("INFLUXDB_BUCKET environment variable is not set");
    }

    console.log("InfluxDB integration enabled");
    console.log(`  - URL: ${influxDbUrl}`);
    console.log(`  - Org: ${influxDbOrg}`);
    console.log(`  - Bucket: ${influxDbBucket}`);

    return getInfluxWriteApi({
        url: influxDbUrl,
        token: influxDbToken,
        org: influxDbOrg,
        bucket: influxDbBucket,
    });
})();

void (async () => {
    console.log(`Writing CSV output to ${csvFilename}`);
    void resetCsv();

    await getSouthEastWaterUsage({
        email,
        password,
        daysToExtract,
        onUsageData: async (usageData) => {
            await writeCsvUsageData(usageData);

            if (influxWriteApi) {
                await writeInfluxUsageData(influxWriteApi, usageData);
            }
        },
    });
})();
