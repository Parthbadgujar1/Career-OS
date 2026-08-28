import { getOpportunitySuggestionsAction } from "@/server/actions/opportunities";
import { OpportunitiesPanel } from "@/components/app/opportunities-panel";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  let initialData = null;
  try {
    initialData = await getOpportunitySuggestionsAction();
  } catch {
    // Client will handle errors on refresh
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Discover Opportunities</h1>
        <p className="text-sm text-slate-500">
          AI-curated platforms and opportunities matched to your skills, goals, and career path.
        </p>
      </div>
      <OpportunitiesPanel initialData={initialData} />
    </div>
  );
}
