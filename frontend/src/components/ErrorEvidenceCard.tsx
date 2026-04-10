import type { ApiResponse, Issue, ParsedRecord } from "../types";

interface Props {
  response: ApiResponse;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function getRecordLabel(line: number, records: ParsedRecord[]): string {
  if (!line || !records.length) return "-";

  const record = records.find((item) => item.line_number === line);
  if (!record) return "-";

  if (record.record_type === "0") return "Header";
  if (record.record_type === "9") return "Trailer";

  if (record.record_type === "1") {
    const detalheIndex = records.filter(
      (item) => item.record_type === "1" && item.line_number <= line
    ).length;

    return `Detalhe ${detalheIndex || 1}`;
  }

  return `Registro ${record.record_type}`;
}

function getActionLabel(action: string): string {
  if (action === "auto_corrected") return "Corrigido";
  if (action === "not_corrected") return "Não corrigido";
  return action || "-";
}

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "red" | "amber" | "emerald" | "slate";
}) {
  const styles =
    tone === "red"
      ? "border-red-200 bg-red-100 text-red-700"
      : tone === "amber"
      ? "border-amber-200 bg-amber-100 text-amber-700"
      : tone === "emerald"
      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${styles}`}
    >
      {children}
    </span>
  );
}

function SummaryPill({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "red" | "amber" | "emerald" | "slate";
}) {
  const styles =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em]">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function ExecutiveTable({
  title,
  description,
  issues,
  records,
  tone,
}: {
  title: string;
  description: string;
  issues: Issue[];
  records: ParsedRecord[];
  tone: "red" | "amber";
}) {
  const titleClass = tone === "red" ? "text-red-950" : "text-amber-950";
  const descClass = tone === "red" ? "text-red-700" : "text-amber-700";
  const wrapperClass =
    tone === "red"
      ? "border-red-200 bg-red-50"
      : "border-amber-200 bg-amber-50";

  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${wrapperClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className={`text-lg font-bold ${titleClass}`}>{title}</h3>
          <p className={`mt-1 text-sm ${descClass}`}>{description}</p>
        </div>
        <Badge tone={tone}>{issues.length} item(ns)</Badge>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Tipo
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Campo
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Linha
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Registro
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Posição
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Motivo
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Encontrado
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Esperado
              </th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em]">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {issues.map((issue, index) => {
              const isError = issue.severity === "error";
              const rowClass = isError
                ? "bg-red-50/60"
                : "bg-amber-50/60";

              return (
                <tr
                  key={`${issue.line}-${issue.field}-${index}`}
                  className={`border-t border-slate-200 align-top ${rowClass}`}
                >
                  <td className="px-3 py-3">
                    <Badge tone={isError ? "red" : "amber"}>
                      {isError ? "Erro" : "Aviso"}
                    </Badge>
                  </td>

                  <td className="px-3 py-3 font-semibold text-slate-900">
                    {issue.field || "-"}
                  </td>

                  <td className="px-3 py-3 text-slate-800">
                    {issue.line || "-"}
                  </td>

                  <td className="px-3 py-3 text-slate-800">
                    {getRecordLabel(issue.line, records)}
                  </td>

                  <td className="px-3 py-3 text-slate-800">
                    {issue.positions || "-"}
                  </td>

                  <td className="px-3 py-3 text-slate-900">
                    {issue.reason || "-"}
                  </td>

                  <td className="px-3 py-3 font-medium text-slate-900">
                    {renderValue(issue.from)}
                  </td>

                  <td className="px-3 py-3 font-medium text-slate-900">
                    {renderValue(issue.to)}
                  </td>

                  <td className="px-3 py-3">
                    <Badge
                      tone={
                        issue.action === "auto_corrected"
                          ? "emerald"
                          : issue.action === "not_corrected"
                          ? "red"
                          : "slate"
                      }
                    >
                      {getActionLabel(issue.action)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ErrorEvidenceCard({ response }: Props) {
  const issues: Issue[] = response.issues ?? [];
  const records: ParsedRecord[] = response.parsed?.records ?? [];

  const errors = issues.filter((item) => item.severity === "error");
  const warnings = issues.filter((item) => item.severity === "warning");
  const autoCorrected = issues.filter((item) => item.action === "auto_corrected");

  if (!issues.length) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <div className="text-sm font-semibold text-emerald-800">
          Nenhuma inconsistência encontrada
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Resumo das inconsistências</h2>
        <p className="mt-1 text-sm text-slate-600">
          Visual direto para evidenciar rapidamente onde estão os problemas do arquivo.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryPill label="Total" value={issues.length} />
          <SummaryPill label="Erros" value={errors.length} tone="red" />
          <SummaryPill label="Avisos" value={warnings.length} tone="amber" />
          <SummaryPill label="Corrigidos" value={autoCorrected.length} tone="emerald" />
        </div>
      </div>

      {!!errors.length && (
        <ExecutiveTable
          title="Erros encontrados"
          description="Inconsistências críticas identificadas no arquivo."
          issues={errors}
          records={records}
          tone="red"
        />
      )}

      {!!warnings.length && (
        <ExecutiveTable
          title="Avisos encontrados"
          description="Itens de atenção que não têm o mesmo peso dos erros."
          issues={warnings}
          records={records}
          tone="amber"
        />
      )}
    </section>
  );
}