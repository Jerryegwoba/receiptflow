import { z } from "zod";

export const taxCategories = [
  "Software & Tools",
  "Marketing",
  "Office Supplies",
  "Travel & Transport",
  "Meals & Entertainment",
  "Professional Services",
  "Equipment",
  "Utilities",
  "Rent",
  "Miscellaneous",
] as const;

export const extractedReceiptSchema = z.object({
  merchant: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be ISO format YYYY-MM-DD"),
  amount: z.number().positive(),
  currency: z.string().length(3, "Currency must be 3-letter code"),
  category: z.enum(taxCategories),
  confidence: z.number().min(0).max(100),
  notes: z.string().optional(),
});

export type ExtractedReceipt = z.infer<typeof extractedReceiptSchema>;
