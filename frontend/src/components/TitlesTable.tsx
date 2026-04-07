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
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-sm font-medium text-slate-700">
          {titles.length} título(s) exibido(s)
        </div>
      </div>

      {!titles.length ? (
        <div className="px-5 py-6 text-sm text-slate-500">
          Nenhum título encontrado com o filtro informado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead className="bg-white">
              <tr>
                <Th>Linha</Th>
                <Th>Documento</Th>
                <Th>Sacado</Th>
                <Th>Vencimento</Th>
                <Th>Valor título</Th>
                <Th>Valor presente</Th>
                <Th>Abatimento</Th>
                <Th>Deságio</Th>
                <Th>Cedente</Th>
                <Th>Ocorrência</Th>
              </tr>
            </thead>
            <tbody>
              {titles.map((title, index) => {
                const selected = selectedIndex === index;

                return (
                  <tr
                    key={`${title.numero_documento}-${index}`}
                    className={[
                      "cursor-pointer border-t border-slate-200 transition",
                      selected ? "bg-indigo-50" : "hover:bg-slate-50",
                    ].join(" ")}
                    onClick={() => onSelect(index)}
                  >
                    <Td>{title.line_number ?? "-"}</Td>
                    <Td>{title.numero_documento || "-"}</Td>
                    <Td>{title.sacado || "-"}</Td>
                    <Td>{title.data_vencimento || "-"}</Td>
                    <Td>{money(title.valor_titulo)}</Td>
                    <Td>{money(title.valor_presente)}</Td>
                    <Td>{money(title.valor_abatimento)}</Td>
                    <Td>
                      <span
                        className={
                          title.valor_desagio > 0
                            ? "font-semibold text-amber-700"
                            : "text-slate-700"
                        }
                      >
                        {money(title.valor_desagio)}
                      </span>
                    </Td>
                    <Td>{title.cedente_nome || "-"}</Td>
                    <Td>{title.ocorrencia || "-"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-sm text-slate-700">{children}</td>;
}