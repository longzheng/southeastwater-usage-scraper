import { Response } from "@playwright/test";
import { z } from "zod";

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
        PeriodType: z.literal("hourly"),
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
    const returnValueString = auraData.actions[0].returnValue;
    const returnValue = returnValueSchema.parse(JSON.parse(returnValueString));
    const usageString = returnValue.usage;
    const usageData = usageSchema.parse(JSON.parse(usageString));

    return usageData[0];
}
