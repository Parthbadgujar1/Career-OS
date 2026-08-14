"use client";

import { useState } from "react";
import { createProjectAction, recommendProjectsAction } from "@/server/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function CreateProjectForm() {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={async (fd) => {
        setPending(true);
        await createProjectAction(fd);
        setPending(false);
      }}
      className="space-y-3"
    >
      <div>
        <Label htmlFor="title">Project title</Label>
        <Input id="title" name="title" required placeholder="e.g. Sales Dashboard" />
      </div>
      <div>
        <Label htmlFor="description">What does it do?</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <div>
        <Label htmlFor="techStack">Tech stack (comma separated)</Label>
        <Input id="techStack" name="techStack" placeholder="Python, pandas, Power BI" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add project"}
      </Button>
    </form>
  );
}

export function RecommendButton() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      action={async () => {
        setPending(true);
        const res = await recommendProjectsAction();
        if (res && "ok" in res) setMsg(`Added ${res.count} AI-recommended projects below.`);
        setPending(false);
      }}
    >
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Generating..." : "Get AI project recommendations"}
      </Button>
      {msg && <p className="mt-2 text-xs text-emerald-600">{msg}</p>}
    </form>
  );
}
