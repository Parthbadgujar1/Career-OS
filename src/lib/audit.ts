import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Fire-and-forget audit logging for privileged / sensitive actions.
 * Never throws — audit failures must not break the user-facing flow.
 */
export async function audit(entry: {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorRole: entry.actorRole ?? null,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      },
    });
  } catch (err) {
    console.error("[audit:error]", err);
  }
}
