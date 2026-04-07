import type { ApiResponse } from "../types";

interface Props {
  response: ApiResponse;
  onDownload?: () => void;
}

export function ResultOverviewCard({ response, onDownload }: Props) {
  const issues = response.issues ?? [];
  const errors = issues.filter((item) => item.severity === "error").length;
  const warnings = issues.filter((item) => item.severity === "warning").length;
  const corrections = response.summary?.auto_corrected ?? 0;
  const titles = response.business_view?.operacao?.quantidade_titulos ?? 0;

  const status =
    errors > 0
      ? {
          title: "Arquivo com pendências",
          text: "Foram encontradas inconsistências que exigem atenção antes do uso final.",
          tone: "border-red-200 bg-red-50 text-red-800",
        }
      : warnings > 0 || corrections > 0
      ? {
          title: "Arquivo processado com ajustes",
          text: "O sistema aplicou correções seguras e registrou avisos para conferência.",
          tone: "border-amber-200 bg-amber-50 text-amber-800",
        }
      : {
          title: "Arquivo válido nas regras modeladas",
          text: "Nenhuma inconsistência foi encontrada no conjunto atual de validações.",
          tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
        };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Resultado principal
          </span>
          <div className={`mt-3 rounded-2xl border px-5 py-4 ${status.tone}`}>
            <div className="text-base font-semibold">{status.title}</div>
            <div className="mt-1 text-sm">{status.text}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {onDownload && (
            <button
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              onClick={onDownload}
              type="button"
            >
              Baixar corrigido
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Erros" value={String(errors)} />
        <Stat label="Warnings" value={String(warnings)} />
        <Stat label="Correções" value={String(corrections)} />
        <Stat label="Títulos encontrados" value={String(titles)} />
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
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}