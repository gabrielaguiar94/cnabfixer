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
    <section className="card">
      <div className="card-header-inline">
        <div>
          <span className="section-kicker">Operação</span>
          <h2>Resumo financeiro</h2>
        </div>
      </div>

      <div className="summary-grid">
        <div className="stat">
          <span className="stat-label">Quantidade de títulos</span>
          <strong>{operation.quantidade_titulos}</strong>
        </div>

        <div className="stat">
          <span className="stat-label">Total valor título</span>
          <strong>{money(operation.total_valor_titulo)}</strong>
        </div>

        <div className="stat">
          <span className="stat-label">Total valor presente</span>
          <strong>{money(operation.total_valor_presente)}</strong>
        </div>

        <div className="stat">
          <span className="stat-label">Total abatimento</span>
          <strong>{money(operation.total_valor_abatimento)}</strong>
        </div>

        <div className="stat">
          <span className="stat-label">Total pago</span>
          <strong>{money(operation.total_valor_pago)}</strong>
        </div>

        <div className="stat">
          <span className="stat-label">Total deságio</span>
          <strong>{money(operation.total_desagio)}</strong>
        </div>
      </div>
    </section>
  );
}