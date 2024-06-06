import "dotenv/config";
import { getSouthEastWaterUsage } from "./helpers/southEastWater";
import { resetCsv, writeCsvUsageData } from "./helpers/csv";

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

void (async () => {
    void resetCsv();

    await getSouthEastWaterUsage({
        email,
        password,
        daysToExtract,
        onUsageData: async (usageData) => {
            await writeCsvUsageData(usageData);
        },
    });
})();
