import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function insertAuditLog({
  request,
  userId,
  action,
  entityId,
  details,
}: {
  request: Request;
  userId: number;
  action: string;
  entityId: number;
  details: string;
}) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() || null;

  await query(
    `INSERT INTO audit_logs (
      user_id, action, entity_type, entity_id, details, ip_address
    ) VALUES ($1, $2, 'user', $3, $4, $5)`,
    [userId, action, entityId, details, ipAddress]
  );
}
