import type { ApiResponse, Issue, ParsedRecord } from "../types";

interface Props {
  response: ApiResponse;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "";
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

export function IssuesCard({ response }: Props) {
  const issues: Issue[] = response.issues ?? [];
  const records: ParsedRecord[] = response.parsed?.records ?? [];

  const errors = issues.filter((item) => item.severity === "error");
  const warnings = issues.filter((item) => item.severity === "warning");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <IssueCounter
          title="Erros que exigem atenção"
          value={errors.length}
          tone="red"
          description="Campos divergentes do layout ou valores não aceitos pelas regras modeladas."
        />
        <IssueCounter
          title="Warnings e ajustes"
          value={warnings.length}
          tone="amber"
          description="Avisos e correções automáticas aplicadas sem comprometer o posicionamento."
        />
      </div>

      {!issues.length ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="text-sm font-semibold text-emerald-800">
            Nenhuma inconsistência encontrada
          </div>
          <p className="mt-1 text-sm text-emerald-700">
            O arquivo passou pelas regras atualmente modeladas no sistema.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Registro</Th>
                  <Th>Linha</Th>
                  <Th>Campo</Th>
                  <Th>Posições</Th>
                  <Th>Status</Th>
                  <Th>Ação</Th>
                  <Th>Valor atual</Th>
                  <Th>Valor esperado/corrigido</Th>
                  <Th>Descrição</Th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, index) => (
                  <tr
                    key={`${issue.line}-${issue.field}-${index}`}
                    className="border-t border-slate-200"
                  >
                    <Td>{getRecordLabel(issue.line, records)}</Td>
                    <Td>{issue.line}</Td>
                    <Td>{issue.field}</Td>
                    <Td>{issue.positions}</Td>
                    <Td>
                      <SeverityBadge severity={issue.severity} />
                    </Td>
                    <Td>{issue.action}</Td>
                    <Td>{renderValue(issue.from)}</Td>
                    <Td>{renderValue(issue.to)}</Td>
                    <Td>{issue.reason}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function IssueCounter({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: number;
  description: string;
  tone: "red" | "amber";
}) {
  const styles =
    tone === "red"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className={`rounded-2xl border px-5 py-4 ${styles}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-sm opacity-90">{description}</div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const style =
    severity === "error"
      ? "bg-red-100 text-red-700"
      : severity === "warning"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {severity}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-sm text-slate-700">{children}</td>;
}