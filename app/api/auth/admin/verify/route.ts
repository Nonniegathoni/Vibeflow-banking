import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const result = await query(
      "SELECT id, email, first_name, last_name, role, verification_code, verification_code_expires_at FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    if (!user.verification_code || !user.verification_code_expires_at) {
      return NextResponse.json(
        { message: "No verification code found" },
        { status: 400 }
      );
    }

    if (new Date() > user.verification_code_expires_at) {
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      );
    }

    if (user.verification_code !== code) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 401 }
      );
    }

    await query(
      "UPDATE users SET verification_code = NULL, verification_code_expires_at = NULL WHERE id = $1",
      [user.id]
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        twoFactorVerified: true,
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "4h" }
    );

    const response = new NextResponse(
      JSON.stringify({
        message: "Verification successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 4 * 60 * 60, // 4 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
