import { Hono } from "hono";
import { authRouter } from "./routes/auth";
import { cors } from "hono/cors";
import { newsRouter } from "./routes/news";
import { adminRouter } from "./routes/admin";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
app.get("/", (c) => {
  return c.text("Hono server is live!");
});
app.use("/*", cors());
app.route("/api/news/v1/auth", authRouter);
app.route("/api/news/v1/news", newsRouter);
app.route("/api/admin", adminRouter);
export default app;
