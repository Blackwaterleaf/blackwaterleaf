import { z } from "zod";
import { smartDeviceMetricSchema } from "../shared/blackwaterleaf-contract-v1";

export const SMART_MEASUREMENT_UNITS = {
  temperatureC: "°C",
  ph: "pH",
  gh: "°dGH",
  kh: "°dKH",
  nitriteMgL: "mg/l",
  nitrateMgL: "mg/l",
  conductivityUs: "µS/cm",
} as const satisfies Record<z.infer<typeof smartDeviceMetricSchema>, string>;

export const smartMeasurementInputSchema = z
  .object({
    habitatId: z.number().int().positive(),
    deviceConnectionId: z.number().int().positive().nullable().optional(),
    metric: smartDeviceMetricSchema,
    value: z.number().finite().min(-5).max(100_000),
    observedAt: z.string().datetime().optional(),
  })
  .strict();

export function unitForSmartMetric(metric: z.infer<typeof smartDeviceMetricSchema>) {
  return SMART_MEASUREMENT_UNITS[metric];
}
