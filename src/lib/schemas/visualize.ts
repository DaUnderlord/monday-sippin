import { z } from "zod"

export const playSpecSchema = z.object({
  version: z.literal("1.0"),
  context: z.object({
    articleId: z.string().optional(),
    source: z.string().default("monday-sippin"),
    extractedAt: z.string(),
  }),
  symbol: z.string(),
  timeframe: z.enum(["1D", "4H", "1H", "15M"]).default("1D"),
  bias: z.enum(["bullish", "bearish", "neutral"]).default("neutral"),
  indicators: z
    .array(
      z.object({
        type: z.string(),
        length: z.number().optional(),
      })
    )
    .default([]),
  levels: z
    .array(
      z.object({
        type: z.enum(["support", "resistance", "trendline"]).default("support"),
        price: z.number(),
        label: z.string().optional(),
      })
    )
    .default([]),
  zones: z
    .array(
      z.object({
        type: z.enum(["supply", "demand"]).default("supply"),
        top: z.number(),
        bottom: z.number(),
        label: z.string().optional(),
      })
    )
    .default([]),
  entries: z.array(z.object({ price: z.number(), rationale: z.string().optional() })).default([]),
  stops: z.array(z.object({ price: z.number() })).default([]),
  targets: z.array(z.object({ price: z.number(), weight: z.number().optional() })).default([]),
  annotations: z
    .array(
      z.object({
        atPrice: z.number().optional(),
        atTime: z.string().optional(),
        text: z.string(),
        linkToSentenceIds: z.array(z.string()).optional(),
      })
    )
    .default([]),
  scenarios: z
    .array(
      z.object({
        name: z.string(),
        probability: z.number().min(0).max(1).optional(),
        path: z
          .array(
            z.object({
              t: z.string(),
              price: z.number(),
            })
          )
          .default([]),
      })
    )
    .default([]),
  provenance: z
    .array(
      z.object({
        sentenceId: z.string(),
        text: z.string(),
        feature: z.string(),
      })
    )
    .default([]),
})

export type PlaySpec = z.infer<typeof playSpecSchema>

export const visualizeRequestSchema = z.object({
  articleId: z.string().optional(),
  content: z.string().min(20, "content too short for extraction").optional(),
  symbol: z.string().optional(),
  timeframe: z.enum(["1D", "4H", "1H", "15M"]).optional(),
})

export type VisualizeRequest = z.infer<typeof visualizeRequestSchema>
