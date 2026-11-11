import { z } from 'zod'

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  .refine((value) => {
    const date = new Date(value + 'T00:00:00Z')
    if (Number.isNaN(date.getTime())) return false
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setUTCFullYear(fiveYearsAgo.getUTCFullYear() - 5)
    return date <= new Date() && date >= fiveYearsAgo
  }, 'Data fora do intervalo permitido')

export const ratingSchema = z.object({
  cafeSlug: z.string().trim().min(1),
  taste: z.number().int().min(1).max(5),
  milkTexture: z.number().int().min(1).max(5),
  temperature: z.number().int().min(1).max(5),
  value: z.number().int().min(1).max(5),
  priceCents: z.number().int().min(0).max(2000),
  milkType: z.enum(['whole', 'oat', 'lactose_free', 'other']),
  size: z.enum(['regular', 'large']),
  visitedOn: isoDate,
  note: z.string().trim().max(280).optional(),
})

export const suggestionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  addressLine: z.string().trim().min(3).max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  note: z.string().trim().max(280).optional(),
})

export const nicknameSchema = z.object({
  nickname: z.string().trim().min(2).max(30),
})

export type NicknameInput = z.infer<typeof nicknameSchema>

export const reportSchema = z.object({
  ratingId: z.string().uuid(),
  reason: z.enum(['spam', 'offensive', 'wrong_place', 'other']),
})

export type ReportInput = z.infer<typeof reportSchema>

export type SuggestionInput = z.infer<typeof suggestionSchema>

export type RatingInput = z.infer<typeof ratingSchema>
