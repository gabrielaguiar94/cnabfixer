import type { ApiResponse, Issue } from "../types";

interface Props {
  response: ApiResponse;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function IssuesCard({ response }: Props) {
  const issues: Issue[] = response.issues ?? [];

  return (
    <section className="card">
      <div className="card-header-inline">
        <div>
          <span className="section-kicker">Validação</span>
          <h2>Inconsistências encontradas</h2>
        </div>
      </div>

      {!issues.length ? (
        <div className="empty-state">
          <strong>Nenhuma inconsistência encontrada</strong>
          <p className="muted no-margin">
            O arquivo passou pelas regras atualmente modeladas no sistema.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Linha</th>
                <th>Campo</th>
                <th>Posições</th>
                <th>Severidade</th>
                <th>Ação</th>
                <th>De</th>
                <th>Para</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr key={`${issue.line}-${issue.field}-${index}`}>
                  <td>{issue.line}</td>
                  <td>{issue.field}</td>
                  <td>{issue.positions}</td>
                  <td>
                    <span
                      className={`badge ${
                        issue.severity === "error"
                          ? "badge-error"
                          : issue.severity === "warning"
                          ? "badge-warning"
                          : "badge-neutral"
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td>{issue.action}</td>
                  <td>{renderValue(issue.from)}</td>
                  <td>{renderValue(issue.to)}</td>
                  <td>{issue.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}