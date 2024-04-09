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

newsRouter.post("/add", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  for (let i = 0; i < body.length; i++) {
    const create = await prisma.news.create({
      data: {
        title: body[i].title,
        description: body[i].description,
        catagory: "general",
      },
    });
    if (!create) {
      console.log("data add failed");
      return c.json({ message: "data add failed" });
    }
  }
  console.log("success");
  return c.text("received");
});

newsRouter.get("/news", async (c) => {
  const { api, count, catagory } = c.req.queries();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const finduder = await prisma.user.findUnique({
    where: {
      id: api[0],
    },
  });
  if (!finduder) {
    return c.json({ status: 400, message: "Invalid API" });
  }
  if (finduder.premium == false) {
    // free user logic
  }

  //const data = await prisma.news.findMany({});
  return c.json({ data: "hi there" });
});
