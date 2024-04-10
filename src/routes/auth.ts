import { Hono } from "hono";
import { Prisma, PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
import { z } from "zod";
export const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

const fullNameSchema = z.string().max(40);
const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);

authRouter.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    console.log(body.fullname, body.password, body.email);
    const fullNameRes = fullNameSchema.safeParse(body.fullname);
    const emailRes = emailSchema.safeParse(body.email);
    const passwordRes = passwordSchema.safeParse(body.password);
    if (!fullNameRes.success || !emailRes.success || !passwordRes.success) {
      return c.json({ status: 400, message: "Invalid user inputs" });
    }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const email = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (email) {
      return c.json({ status: 401, message: "This email is already in use" });
    }
    const user = await prisma.user.create({
      data: {
        fullname: body.fullname,
        email: body.email,
        password: body.password,
        premium: false,
      },
    });
    console.log(user);
    if (!user) {
      return c.json({
        status: 401,
        message: "signup failed",
      });
    }
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({
      status: 200,
      token: jwt,
      message: "Signup successful",
      api: user.id,
    });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400, message: "Signup failed" });
  }
});

authRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const emailRes = emailSchema.safeParse(body.email);
    const passwordRes = passwordSchema.safeParse(body.password);
    if (!emailRes.success || !passwordRes.success) {
      return c.json({
        status: 400,
        message: "Invalid email address and password",
      });
    }
    console.log(emailRes);
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user) {
      return c.json({
        status: 401,
        message: "User not found, Please check your email and password",
      });
    }
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({
      status: 200,
      token: jwt,
      message: "Login successful",
      api: user.id,
    });
  } catch (error) {
    console.log(error);
    return c.json({ status: 400, message: "Login failed" });
  }
});
authRouter.post("/payment", async (c) => {
  const body = await c.req.json();
  const token = body.token;
  const paymentSuccess = body.payment;
  const userId = await verify(token, c.env.JWT_SECRET);
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const findUser = await prisma.user.findUnique({
    where: {
      id: userId.id,
    },
  });

  if (!findUser) {
    return c.json({ status: 400, message: "user not verified" });
  }
  if (paymentSuccess === "success") {
    const makeUserPremium = await prisma.user.update({
      where: {
        id: userId.id,
      },
      data: {
        paymentDate: Date.now(),
        premium: true,
      },
    });

    if (!makeUserPremium) {
      return c.json({
        status: 400,
        message: "Internal error, please contact the team for guidance",
      });
    }
    return c.json({ status: 200, message: "User is now a premium user" });
  }
  if (paymentSuccess === "failed") {
    return c.json({ status: 400, message: "Payment failed" });
  }
});
