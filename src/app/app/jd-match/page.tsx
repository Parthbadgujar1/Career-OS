import { Metadata } from "next";
import { getJdMatchHistoryAction } from "@/server/actions/jd-match";
import { JdMatchForm } from "@/components/app/jd-match-form";

export const metadata: Metadata = { title: "JD Match" };
export const dynamic = "force-dynamic";

export default async function JdMatchPage() {
  const history = await getJdMatchHistoryAction();
  return <JdMatchForm history={history} />;
}
