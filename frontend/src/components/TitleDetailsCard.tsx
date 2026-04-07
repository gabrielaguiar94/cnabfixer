import type { BusinessTitle } from "../types";

interface Props {
  title: BusinessTitle | null;
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value || "-"}
      </div>
    </div>
  );
}

export function TitleDetailsCard({ title }: Props) {
  if (!title) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
        Selecione um título na tabela para visualizar os detalhes.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Título selecionado
          </div>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Documento {title.numero_documento || "-"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Linha {title.line_number ?? "-"} • Sacado {title.sacado || "-"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white">
          {money(title.valor_titulo)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DetailItem label="Controle participante" value={title.numero_controle_participante} />
        <DetailItem label="Ocorrência" value={title.ocorrencia} />
        <DetailItem label="Sacado" value={title.sacado} />
        <DetailItem label="Tipo inscrição sacado" value={title.tipo_inscricao_sacado} />
        <DetailItem label="Inscrição sacado" value={title.numero_inscricao_sacado} />
        <DetailItem label="Cedente" value={title.cedente_nome} />
        <DetailItem label="CNPJ cedente" value={title.cedente_cnpj} />
        <DetailItem label="Data emissão" value={title.data_emissao} />
        <DetailItem label="Data vencimento" value={title.data_vencimento} />
        <DetailItem label="Espécie título" value={title.especie_titulo} />
        <DetailItem label="Termo cessão" value={title.numero_termo_cessao} />
        <DetailItem label="CEP sacado" value={title.cep_sacado} />
        <DetailItem label="Endereço" value={title.endereco_completo} />
        <DetailItem label="Valor título" value={money(title.valor_titulo)} />
        <DetailItem label="Valor presente" value={money(title.valor_presente)} />
        <DetailItem label="Valor abatimento" value={money(title.valor_abatimento)} />
        <DetailItem label="Valor pago" value={money(title.valor_pago)} />
        <DetailItem label="Valor deságio" value={money(title.valor_desagio)} />
      </div>
    </div>
  );
}