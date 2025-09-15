import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

// Cleanup feedback older than 7 days (runs on every POST)
async function cleanupOld() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await prisma.feedback.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Auto-clean expired data
    await cleanupOld();

    // Always treat it as new feedback
    const assignedUserId = userId || uuid(); // generate one if new user

    const savedFeedback = await prisma.feedback.create({
      data: {
        id: uuid(),
        userId: assignedUserId,
        name,
        email,
        phone,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      feedbackId: savedFeedback.id,
      userId: assignedUserId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
