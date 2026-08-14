"use client";

import { useState } from "react";
import { recordMockInterviewAction } from "@/server/actions/activities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea, Select } from "@/components/ui/input";

export function MockInterviewForm({ defaultRole }: { defaultRole: string }) {
  const [pending, setPending] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a mock interview</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (fd) => {
            setPending(true);
            await recordMockInterviewAction(fd);
            setPending(false);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" defaultValue="TECHNICAL">
                <option value="TECHNICAL">Technical</option>
                <option value="HR">HR</option>
                <option value="BEHAVIORAL">Behavioral</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" defaultValue={defaultRole} />
            </div>
            <div>
              <Label htmlFor="score">Score</Label>
              <Input id="score" name="score" type="number" min={0} max={10} defaultValue={0} />
            </div>
            <div>
              <Label htmlFor="maxScore">Max score</Label>
              <Input id="maxScore" name="maxScore" type="number" min={1} defaultValue={10} />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Feedback / notes</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="What went well? What to improve?" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save interview"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
