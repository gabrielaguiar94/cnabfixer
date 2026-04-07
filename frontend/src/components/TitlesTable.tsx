import type { BusinessTitle } from "../types";

interface Props {
  titles: BusinessTitle[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function TitlesTable({ titles, selectedIndex, onSelect }: Props) {
  return (
    <section className="card">
      <div className="card-header-inline">
        <div>
          <span className="section-kicker">Títulos</span>
          <h2>Visão da operação por detalhe</h2>
        </div>
      </div>

      {!titles.length ? (
        <p className="muted">Nenhum título encontrado.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Linha</th>
                <th>Documento</th>
                <th>Sacado</th>
                <th>Vencimento</th>
                <th>Valor título</th>
                <th>Valor presente</th>
                <th>Abatimento</th>
                <th>Deságio</th>
                <th>Cedente</th>
                <th>Ocorrência</th>
              </tr>
            </thead>
            <tbody>
              {titles.map((title, index) => (
                <tr
                  key={`${title.numero_documento}-${index}`}
                  className={selectedIndex === index ? "row-selected" : "row-clickable"}
                  onClick={() => onSelect(index)}
                >
                  <td>{title.line_number ?? "-"}</td>
                  <td>{title.numero_documento || "-"}</td>
                  <td>{title.sacado || "-"}</td>
                  <td>{title.data_vencimento || "-"}</td>
                  <td>{money(title.valor_titulo)}</td>
                  <td>{money(title.valor_presente)}</td>
                  <td>{money(title.valor_abatimento)}</td>
                  <td>{money(title.valor_desagio)}</td>
                  <td>{title.cedente_nome || "-"}</td>
                  <td>{title.ocorrencia || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}