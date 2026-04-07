import type { ApiResponse } from "../types";

interface Props {
  response: ApiResponse;
}

export function JsonCard({ response }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-lg font-semibold text-slate-950">Resposta JSON completa</h3>
      <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}