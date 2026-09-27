import { PRO_FEATURES, PRO_MONTHLY_PRICE_EUR, PRO_YEARLY_PRICE_EUR, FREE_FEATURES } from "@shared/monetization";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const billingRouter = router({
  plans: publicProcedure.query(() => ({
    free: { name: "Free", features: FREE_FEATURES },
    pro: { name: "BlackWaterLeaf Pro", monthlyPriceEur: PRO_MONTHLY_PRICE_EUR, yearlyPriceEur: PRO_YEARLY_PRICE_EUR, features: PRO_FEATURES },
    creator: { name: "Creator / Expert", status: "later" as const, features: ["Fach-LIVEs", "Subscriber-only Videos", "Creator-Statistiken", "Community-Badges"] },
  })),
  me: protectedProcedure.query(() => ({ plan: "free" as const, active: false, paymentReady: false as const })),
});
