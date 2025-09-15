// app/api/feedback/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

/**
 * cleanupOld:
 * - Remove Reply and Feedback older than 7 days
 * - Called on each POST (lightweight), ensures no stale data
 */
async function cleanupOld() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  // delete replies older than cutoff
  await prisma.reply.deleteMany({
    where: {
      createdAt: { lt: cutoff },
    },
  });

  // delete feedback older than cutoff
  await prisma.feedback.deleteMany({
    where: {
      createdAt: { lt: cutoff },
    },
  });

  // optional: delete chat messages older than cutoff as well
  await prisma.chatMessage.deleteMany({
    where: {
      createdAt: { lt: cutoff },
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email, phone, message, replyToId, fromAdmin } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Perform cleanup (safe even if DB empty)
    await cleanupOld();

    // If this is a reply to existing feedback
    if (replyToId) {
      // Ensure feedback exists (optional safety)
      const parent = await prisma.feedback.findUnique({ where: { id: replyToId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent feedback not found" }, { status: 404 });
      }

      const savedReply = await prisma.reply.create({
        data: {
          id: uuid(),
          feedbackId: replyToId,
          message,
          fromAdmin: Boolean(fromAdmin) || true, // default to admin-reply if provided
        },
      });

      return NextResponse.json({ success: true, replyId: savedReply.id });
    }

    // New feedback: assign stable userId or create one for the user
    const assignedUserId = userId || uuid();

    const savedFeedback = await prisma.feedback.create({
      data: {
        id: uuid(),
        userId: assignedUserId,
        name: name ?? null,
        email: email ?? null,
        phone: phone ?? null,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      feedbackId: savedFeedback.id,
      userId: assignedUserId,
    });
  } catch (err: any) {
    console.error("Feedback POST error:", err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
  }
