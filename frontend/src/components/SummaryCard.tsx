import type { ApiResponse } from "../types";

interface Props {
  response: ApiResponse;
}

export function SummaryCard({ response }: Props) {
  const summary = response.summary;
  const issues = response.issues ?? [];
  const errors = issues.filter((item) => item.severity === "error").length;
  const warnings = issues.filter((item) => item.severity === "warning").length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Resultado
        </span>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Status do processamento
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Layout" value={response.layout ?? "-"} />
        <Stat label="Arquivo de entrada" value={response.input_file ?? "-"} />
        <Stat label="Arquivo de saída" value={response.output_file ?? "-"} />
        <Stat label="Linhas" value={String(summary?.total_lines ?? "-")} />
        <Stat label="Correções automáticas" value={String(summary?.auto_corrected ?? 0)} />
        <Stat label="Erros" value={String(errors)} />
        <Stat label="Warnings" value={String(warnings)} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}