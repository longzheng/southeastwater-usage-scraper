import type { Response } from '@playwright/test';
import { z } from 'zod';

export const auraSchema = z.object({
    actions: z.array(
        z.object({
            id: z.string(),
            state: z.string(),
            returnValue: z.object({
                returnValue: z.array(
                    z.object({
                        apiDate: z.string(),
                        hasBlockedData: z.boolean(),
                        message: z.string(),
                        readings: z.array(z.number()),
                        resolution: z.string(),
                        serialNo: z.string(),
                        status: z.number(),
                    }),
                ),
            }),
            error: z.array(z.unknown()),
        }),
    ),
});

type AuraSchema = z.infer<typeof auraSchema>;

export type UsageData = {
    date: Date;
    localIsoString: string;
    localDateString: string;
    hour: number;
    measurement: number;
}[];

export async function parseAuraResponse(
    response: Response,
): Promise<UsageData> {
    const responseJson = (await response.json()) as unknown;

    return parseAuraResponseJson(responseJson);
}

export function parseAuraResponseJson(json: unknown): UsageData {
    const data = auraSchema.parse(json);

    if (data.actions.length !== 1) {
        throw new Error('Expected one action');
    }

    const firstAction = data.actions[0]!;

    if (firstAction.returnValue.returnValue.length !== 1) {
        throw new Error('Expected one return value');
    }

    const firstReturnValue = firstAction.returnValue.returnValue[0]!;

    if (firstReturnValue.resolution !== 'hourly') {
        throw new Error('Expected hourly resolution');
    }

    if (firstReturnValue.readings.length !== 24) {
        throw new Error('Expected 24 readings');
    }

    const usageData = convertUsageData(firstReturnValue);

    return usageData;
}

function convertUsageData(
    returnValue: AuraSchema['actions'][number]['returnValue']['returnValue'][number],
): UsageData {
    // get just the date part of the string
    // the API returns ISO8601 date strings with the UTC timezone even though they're local dates
    // "apiDate": "2024-11-16T00:00:00+00:00",
    const localDateString = returnValue.apiDate.split('T')[0]!;

    const results: UsageData = [];

    for (let i = 0; i < returnValue.readings.length; i++) {
        const hour = i.toString().padStart(2, '0');
        const localIsoString = `${localDateString}T${hour}:00:00`;
        const localDate = new Date(`${localDateString}T${hour}:00:00`);

        results.push({
            date: localDate,
            localIsoString,
            localDateString,
            hour: i,
            measurement: returnValue.readings[i]!,
        });
    }

    return results;
}
