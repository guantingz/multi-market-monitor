import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getQuote, getKlines } from "./marketData";

const marketTypeSchema = z.enum(['fx', 'cn', 'hk', 'us', 'crypto', 'commodities']);
const timeframeSchema = z.enum(['1D', '4H', '1H', '15m', '5m']);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ---- Market Data Proxy ----
  market: router({
    // Get real-time quote for a single symbol
    quote: publicProcedure
      .input(z.object({
        symbol: z.string(),
        market: marketTypeSchema,
      }))
      .query(async ({ input }) => {
        return await getQuote(input.symbol, input.market);
      }),

    // Get multiple quotes at once (for watchlist)
    quotes: publicProcedure
      .input(z.object({
        symbols: z.array(z.object({
          symbol: z.string(),
          market: marketTypeSchema,
        })),
      }))
      .query(async ({ input }) => {
        const results = await Promise.allSettled(
          input.symbols.map(({ symbol, market }) => getQuote(symbol, market))
        );
        return results.map((r, i) => ({
          symbol: input.symbols[i].symbol,
          data: r.status === 'fulfilled' ? r.value : null,
          error: r.status === 'rejected' ? String(r.reason) : null,
        }));
      }),

    // Get K-line (OHLCV) data
    klines: publicProcedure
      .input(z.object({
        symbol: z.string(),
        market: marketTypeSchema,
        timeframe: timeframeSchema,
        limit: z.number().int().min(10).max(1000).default(300),
      }))
      .query(async ({ input }) => {
        return await getKlines(input.symbol, input.market, input.timeframe, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
