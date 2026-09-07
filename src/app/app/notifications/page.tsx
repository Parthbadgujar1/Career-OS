import { requireStudentProfile } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/server/actions/notifications";
import { Bell, AlertTriangle, Megaphone, BarChart3, Briefcase, Clock, CheckCheck, Check } from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "indigo"; icon: typeof Bell }> = {
  ALERT: { label: "Mentor", variant: "indigo", icon: AlertTriangle },
  INFO: { label: "Announcement", variant: "default", icon: Megaphone },
  REMINDER: { label: "Reminder", variant: "warning", icon: Clock },
  REPORT: { label: "Report", variant: "success", icon: BarChart3 },
  OPPORTUNITY: { label: "Opportunity", variant: "secondary", icon: Briefcase },
};

export default async function NotificationsPage() {
  const { profile } = await requireStudentProfile();

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.notification.count({ where: { studentId: profile.id, read: false } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <Button variant="outline" size="sm">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </form>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications ({notifications.length})</CardTitle>
          <CardDescription>Announcements, mentor feedback, reminders, and opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">No notifications yet.</p>
          )}
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.INFO;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className={`rounded-lg border p-4 transition-colors ${n.read ? "border-slate-100 bg-surface" : "border-indigo-200 bg-indigo-50/50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{n.title}</p>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                        {!n.read && <Badge variant="danger">New</Badge>}
                      </div>
                      {n.body && <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{n.body}</p>}
                      <p className="mt-1.5 text-xs text-slate-400">
                        {n.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                  {!n.read && (
                    <form action={markNotificationReadAction.bind(null, n.id)}>
                      <Button type="submit" variant="ghost" size="sm" title="Mark as read">
                        <Check className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
