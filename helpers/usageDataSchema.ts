// import { z } from "zod"

// export const schema = z.object({
//   PeriodType: z.string(),
//   DateTo: z.string(),
//   DateFrom: z.string(),
//   Readings: z.array(z.object({ Measurement: z.number(), Date: z.string() })),
//   Total: z.number(),
//   SerialNumber: z.string()
// })

export interface UsageData {
  PeriodType: string;
  DateTo: string;
  DateFrom: string;
  Readings: Reading[];
  Total: number;
  SerialNumber: string;
}

export interface Reading {
  Measurement: number;
  // "2024-05-29T04:00:00.000Z"
  Date: string;
}

export function convertReadingToCsv(reading: Reading): string {
  return `${reading.Date.substring(
    0, // trim the last Z character since the timezone is local
    reading.Date.length - 1
  )},${reading.Measurement}`;
}
