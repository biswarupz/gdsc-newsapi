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
  const { api, count: countParam, category, keyword } = c.req.queries();
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
  if (findUser.premium === true && findUser.paymentDate) {
    const currentDate = new Date();
    const paymentDate = new Date(Number(findUser.paymentDate)); // Convert BigInt to number before creating Date object
    const daysSinceLastPayment = Math.floor(
      (currentDate.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24)
    );

    if (daysSinceLastPayment >= 30) {
      await prisma.user.update({
        where: {
          id: findUser.id,
        },
        data: {
          premium: false,
        },
      });
    }
  }
  let count = 10;

  if (findUser.premium === true && countParam) {
    count = parseInt(countParam[0], 10);
  }

  const newsQuery: any = {
    take: count,
  };

  if (category) {
    newsQuery.where = {
      category,
    };
  }

  if (keyword) {
    if (!newsQuery.where) {
      newsQuery.where = {};
    }
    newsQuery.where.OR = [
      { title: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  const news = await prisma.news.findMany(newsQuery);

  if (!news) {
    return c.json({
      status: 400,
      message: "News fetching failed",
    });
  }

  return c.json({
    status: 200,
    message: "News fetched successfully",
    data: news,
  });
});
