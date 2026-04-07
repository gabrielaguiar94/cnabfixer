import type { ApiResponse } from "../types";

interface Props {
  response: ApiResponse;
}

export function GroupedCard({ response }: Props) {
  const grouped = response.parsed?.grouped;

  if (!grouped) return null;

  return (
    <div className="space-y-6">
      <TechnicalBlock title="Header" data={grouped.header ?? {}} />
      <TechnicalBlock title="Detalhes" data={grouped.detalhes ?? []} />
      <TechnicalBlock title="Trailer" data={grouped.trailer ?? {}} />
    </div>
  );
}

function TechnicalBlock({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}