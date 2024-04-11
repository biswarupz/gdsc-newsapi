import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
export const adminRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

adminRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const username = body.username;
  const password = body.password;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const checkUniqueUsername = await prisma.admin.findUnique({
    where: {
      username: username,
    },
  });
  if (checkUniqueUsername) {
    return c.json({ status: 401, message: "username already in use" });
  }

  const createAdmin = await prisma.admin.create({
    data: {
      username: username,
      password: password,
    },
  });

  if (!createAdmin) {
    return c.json({ status: 400, message: "ADMIN acc signup failed" });
  }
  const token = await sign(createAdmin.id, c.env.JWT_SECRET);

  return c.json({ status: 200, message: "signup done", token: token });
});

adminRouter.post("/add/news", async (c) => {
  const body = await c.req.json();
  const token = c.req.header("token");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  if (!token) {
    return c.json({
      status: 400,
      message: "Authentical error for admin to add new news",
    });
  }
  const userId = await verify(token, c.env.JWT_SECRET);
  const checkAdmin = await prisma.admin.findUnique({
    where: {
      id: userId.id,
    },
  });
  if (!checkAdmin) {
    return c.json({ status: 400, message: "Admin not valid" });
  }

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
