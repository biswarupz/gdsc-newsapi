import { Hono } from "hono";
import { authRouter } from "./routes/auth";
import { cors } from "hono/cors";

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

export default app;