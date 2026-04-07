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
    <section className="card">
      <div className="card-header-inline">
        <div>
          <span className="section-kicker">Resultado</span>
          <h2>Status do processamento</h2>
        </div>
      </div>

      <div className="summary-grid">
        <div className="stat">
          <span className="stat-label">Layout</span>
          <strong>{response.layout ?? "-"}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Arquivo de entrada</span>
          <strong>{response.input_file ?? "-"}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Arquivo de saída</span>
          <strong>{response.output_file ?? "-"}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Linhas</span>
          <strong>{summary?.total_lines ?? "-"}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Correções automáticas</span>
          <strong>{summary?.auto_corrected ?? 0}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Erros</span>
          <strong>{errors}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Warnings</span>
          <strong>{warnings}</strong>
        </div>
      </div>
    </section>
  );
}