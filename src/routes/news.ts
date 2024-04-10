import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
export const newsRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();


newsRouter.get("/news", async (c) => {
  const { api, count, catagory } = c.req.queries();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const findUser = await prisma.user.findUnique({
    where: {
      id: api[0],
    },
  });
  if (!findUser) {
    return c.json({ status: 400, message: "Invalid API" });
  }
  if (findUser.premium === false) {
    const news = await prisma.news.findMany({
      take: 10,
    });
    if (!news) {
      return c.json({
        status: 400,
        message: "news fetching failed",
      });
    }

    return c.json({
      status: 200,
      message: "news fetched successfully",
      data: news,
    });
  }
  if (findUser.premium === true) {
    if (findUser.paymentDate == null) {
      return;
    } else {
      if (findUser.paymentDate - Date.now() == 30) {
        const findNews = await prisma.news.findMany({
          take: 100,
        });

        if (!findNews) {
          return c.json({ status: 400, message: "News not found" });
        }

        return c.json({
          status: 200,
          message: "data fetched successfully",
          data: findNews,
        });
      }
    }
  }
  return c.json({ data: "hi there" });
});
