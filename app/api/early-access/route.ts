import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserDBAccess } from "@/lib/Users";

// Tight frontend perimeter gateway schema
const earlyAccessSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(150).toLowerCase().trim(),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^[+0-9\s-]+$/)
    .trim(),
  role: z.enum(["Painter", "Homeowner", "Designer"]),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { error: "Empty registration transmission payload" },
        { status: 400 },
      );
    }

    const validationResult = earlyAccessSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failure anomaly",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { name, email, phone, role } = validationResult.data;

    // 1. Check for duplicates in your dedicated marketing leads table
    const isDuplicate = await UserDBAccess.findExistingLead(email, phone);
    if (isDuplicate) {
      return NextResponse.json(
        {
          error:
            "This email or phone network asset is already securely cataloged on our waitlist",
        },
        { status: 409 },
      );
    }

    // 2. Write straight to your standalone marketing table layout
    const newId = await UserDBAccess.registerEarlyAccessLead({
      name,
      email,
      phone,
      role,
    });

    // 3. Dispatch Brevo Waitlist Confirmation Email
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      try {
        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": apiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            subject: "⏳ You're on the List — Welcome to PaintIT Studio Early Access!",
            sender: { name: "PaintIt Studio", email: "tijesunimiidowu16@gmail.com" },
            to: [{ email: email, name: name }],
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 550px; padding: 24px; background-color: #0c0c0e; color: #f5f5f5; border-radius: 16px; border: 1px solid #1f1f23; line-height: 1.6;">
                <h2 style="color: #f59e0b; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.02em;">PaintIT Studio</h2>
                <p style="font-size: 15px; color: #e4e4e7; font-weight: 500;">Hello ${name || "there"},</p>
                <p style="font-size: 13px; color: #a1a1aa;">
                  Thank you for joining the PaintIT Studio private beta early access waitlist as a <strong>${role}</strong>!
                </p>
                <p style="font-size: 13px; color: #a1a1aa;">
                  We are onboarding users in gradual weekly batches to maintain secure, low-latency rendering performance. You've successfully secured your place in line, and we'll send you an invitation link as soon as your slot opens up!
                </p>
                <div style="background-color: #16161a; padding: 14px; border-radius: 10px; border: 1px solid #27272a; margin: 20px 0; text-align: center;">
                  <span style="font-size: 12px; color: #f59e0b; font-weight: bold;">Status: Waiting List Queue Registered ➔</span>
                </div>
                <p style="font-size: 11px; color: #71717a; border-top: 1px solid #1f1f23; padding-top: 14px; margin-top: 24px;">
                  Best regards,<br />The PaintIT Studio Team
                </p>
              </div>
            `
          })
        });

        if (!brevoRes.ok) {
          const errData = await brevoRes.json().catch(() => null);
          console.error("💥 Brevo Early Access Email Error:", JSON.stringify(errData, null, 2));
        } else {
          console.log(`✨ Early Access waitlist email dispatched to ${email}`);
        }
      } catch (emailErr: unknown) {
        const emailErrorMessage =
          emailErr instanceof Error ? emailErr.message : String(emailErr);
        console.error(
          "💥 Early Access Email Dispatch Exception:",
          emailErrorMessage,
        );
      }
    } else {
      console.warn("⚠️ BREVO_API_KEY missing in frontend environment variables.");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Welcome to PaintIt Studio early access!",
        leadId: newId,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("Critical API routing controller context crash:", err);
    return NextResponse.json(
      {
        error:
          "An unexpected transaction error occurred securely inside our data framework",
      },
      { status: 500 },
    );
  }
}
