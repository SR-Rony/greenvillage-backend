import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  unit: z.enum(["kg", "piece", "dozen", "bundle", "litre"]).optional(),
  quantity: z.number().int().nonnegative().optional(),
  category: z.string().min(1),
  images: z.array(z.string().url()).optional()
});