import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  rateLimitResponse,
  callerIdentity,
  REGISTER_RATE,
} from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  try {
    // C-3: rate-limit registration per-IP. 5/hour is plenty for legit retries
    // (typo'd email, wrong password) and starves automated signup farms.
    const limit = checkRateLimit(
      `register:${callerIdentity(req, null)}`,
      REGISTER_RATE
    );
    const limitResponse = rateLimitResponse(
      limit,
      "Too many registration attempts from this address. Wait an hour and try again."
    );
    if (limitResponse) return limitResponse;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }
    const hashed = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        password: hashed,
      },
    });
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("register failed", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
