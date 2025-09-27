import { createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { predictionsRouter } from "./routers/predictions";
import { assetsRouter } from "./routers/assets";
import { forecastersRouter } from "./routers/forecasters";
import { articlesRouter } from "./routers/articles";
import { userActionsRouter } from "./routers/userActions";
import { commentsRouter } from "./routers/comments";
import { statisticsRouter } from "./routers/statistics";
import { contactRouter } from "./routers/contact";
import { adminRouter } from "./routers/admin";
import { marketRouter } from "./routers/market";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  predictions: predictionsRouter,
  assets: assetsRouter,
  forecasters: forecastersRouter,
  articles: articlesRouter,
  userActions: userActionsRouter,
  comments: commentsRouter,
  statistics: statisticsRouter,
  contact: contactRouter,
  admin: adminRouter,
  market: marketRouter,
});

export type AppRouter = typeof appRouter;