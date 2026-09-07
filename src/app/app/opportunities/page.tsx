import { getOpportunitySuggestionsAction, type OpportunityLoadResult } from "@/server/actions/opportunities";
import { OpportunitiesPanel } from "@/components/app/opportunities-panel";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  let initialData: OpportunityLoadResult | null = null;
  try {
    initialData = await getOpportunitySuggestionsAction();
  } catch {
    // Client will poll for status / show a refresh option.
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-slate-900">Discover Opportunities</h1>
        <p className="text-sm text-slate-500">
          AI-curated platforms and opportunities matched to your skills, goals, and career path.
        </p>
      </div>
      <OpportunitiesPanel initialData={initialData} />
    </div>
  );
}
