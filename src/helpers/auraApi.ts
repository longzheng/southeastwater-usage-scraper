import type { Response } from '@playwright/test';
import { z } from 'zod';

export const auraSchema = z.object({
    actions: z.array(
        z.object({
            id: z.string(),
            state: z.string(),
            returnValue: z.string(),
            error: z.array(z.unknown()),
        }),
    ),
});

export const returnValueSchema = z.object({
    usage: z.string(),
});

export const usageSchema = z.array(
    z.object({
        PeriodType: z.literal('hourly'),
        DateTo: z.string(),
        DateFrom: z.string(),
        Readings: z.array(
            z.object({ Measurement: z.number(), Date: z.string() }),
        ),
        Total: z.number(),
        SerialNumber: z.string(),
    }),
);

export type UsageSchema = z.infer<typeof usageSchema>[number];

export async function parseAuraResponse(
    response: Response,
): Promise<UsageSchema> {
    const responseJson = (await response.json()) as unknown;

    return parseAuraResponseJson(responseJson);
}

export function parseAuraResponseJson(json: unknown): UsageSchema {
    const auraData = auraSchema.parse(json);
    const returnValueString = auraData.actions[0]?.returnValue;

    if (!returnValueString) {
        throw new Error('No returnValue found in Aura API response');
    }

    const returnValue = returnValueSchema.parse(JSON.parse(returnValueString));
    const usageString = returnValue.usage;
    const usageData = usageSchema.parse(JSON.parse(usageString));

    if (!usageData[0]) {
        throw new Error('No usage data found in Aura API response');
    }

    return usageData[0];
}

// the API returns ISO8601 date strings with the UTC timezone even though they're local times
// use the new Date() function convert the date string to a local date
export function convertReadingDateToLocalDate(
    reading: UsageSchema['Readings'][number],
): { dateString: string; date: Date } {
    const localDateString = reading.Date.substring(0, reading.Date.length - 1);

    const localDate = new Date(localDateString);

    return { dateString: localDateString, date: localDate };
}
