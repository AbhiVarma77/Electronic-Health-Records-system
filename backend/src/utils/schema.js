import { z } from 'zod';

export const IdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => Number(val))
    .describe('App User ID'),
});

export const HeadersSchema = z.object({
  authorization: z.string(),
});

export const MessageSchema = z.object({
  message: z.string(),
});

export function authenticateSchema(routeOptions) {
  Object.assign(routeOptions.schema, { headers: HeadersSchema });
}
