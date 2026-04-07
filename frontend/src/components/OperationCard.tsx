import type { BusinessOperation } from "../types";

interface Props {
  operation: BusinessOperation;
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function OperationCard({ operation }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Operação
        </span>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          Resumo financeiro
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Quantidade de títulos" value={String(operation.quantidade_titulos)} />
        <Stat label="Total valor título" value={money(operation.total_valor_titulo)} />
        <Stat label="Total valor presente" value={money(operation.total_valor_presente)} />
        <Stat label="Total abatimento" value={money(operation.total_valor_abatimento)} />
        <Stat label="Total pago" value={money(operation.total_valor_pago)} />
        <Stat label="Total deságio" value={money(operation.total_desagio)} />
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
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}