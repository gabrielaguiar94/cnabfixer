import { useMemo, useState } from "react";
import { SummaryCard } from "./components/SummaryCard";
import { IssuesCard } from "./components/IssuesCard";
import { GroupedCard } from "./components/GroupedCard";
import { JsonCard } from "./components/JsonCard";
import { OperationCard } from "./components/OperationCard";
import { TitlesTable } from "./components/TitlesTable";
import { TitleDetailsCard } from "./components/TitleDetailsCard";
import { ResultOverviewCard } from "./components/ResultOverviewCard";
import type { ApiResponse, BusinessTitle } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8765";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [showTechnicalData, setShowTechnicalData] = useState(false);
  const [titleQuery, setTitleQuery] = useState("");

  const allTitles = response?.business_view?.titulos ?? [];

  const filteredTitles = useMemo(() => {
    const query = titleQuery.trim().toLowerCase();
    if (!query) return allTitles;

    return allTitles.filter((item) => {
      return [
        item.numero_documento,
        item.sacado,
        item.cedente_nome,
        item.cedente_cnpj,
        item.numero_inscricao_sacado,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [allTitles, titleQuery]);

  const selectedTitle: BusinessTitle | null = useMemo(() => {
    if (!filteredTitles.length) return null;
    return filteredTitles[selectedTitleIndex] ?? filteredTitles[0];
  }, [filteredTitles, selectedTitleIndex]);

  const canDownload = !!file;

  async function submit(): Promise<void> {
    if (!file) {
      setError("Selecione um arquivo .REM ou .TXT");
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);
    setSelectedTitleIndex(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/cnab/validate-fix-and-parse`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro ao processar arquivo");
      }

      const data = (await res.json()) as ApiResponse;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function downloadCorrected(): Promise<void> {
    if (!file) return;

    try {
      setDownloading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/cnab/validate-and-fix/download`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro ao baixar arquivo corrigido");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^"]+)"?/i);
      const fallbackName = file.name.replace(/(\.[^.]+)?$/, "_CORRIGIDO$1");
      const finalName = match?.[1] || fallbackName;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no download");
    } finally {
      setDownloading(false);
    }
  }

  function resetAll(): void {
    setFile(null);
    setResponse(null);
    setError("");
    setSelectedTitleIndex(0);
    setShowTechnicalData(false);
    setTitleQuery("");
    const input = document.getElementById("cnab-file") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1700px] px-8 py-8 lg:px-10 lg:py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            CNAB Fixer
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Valide, corrija e visualize arquivos CNAB com foco em aderência posicional.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div>
              <label
                htmlFor="cnab-file"
                className="block text-sm font-medium text-slate-700"
              >
                Arquivo CNAB
              </label>

              <label
                htmlFor="cnab-file"
                className="mt-3 flex cursor-pointer flex-col rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-slate-400 hover:bg-slate-100"
              >
                <input
                  id="cnab-file"
                  className="hidden"
                  type="file"
                  accept=".rem,.txt"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setResponse(null);
                    setError("");
                    setSelectedTitleIndex(0);
                    setTitleQuery("");
                  }}
                />

                <span className="text-sm font-semibold text-slate-900">
                  {file ? file.name : "Clique para selecionar um arquivo .REM ou .TXT"}
                </span>

                <span className="mt-1 text-sm text-slate-500">
                  {file
                    ? "Arquivo pronto para processamento"
                    : "O sistema valida, corrige e monta a visão da operação"}
                </span>
              </label>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={submit}
                disabled={loading || !file}
                type="button"
              >
                {loading ? "Processando..." : "Processar arquivo"}
              </button>

              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={downloadCorrected}
                disabled={!canDownload || downloading}
                type="button"
              >
                {downloading ? "Baixando..." : "Baixar corrigido"}
              </button>

              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={resetAll}
                disabled={loading || downloading}
                type="button"
              >
                Limpar
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Processando arquivo...
            </div>
          )}
        </section>

        {response && (
          <div className="mt-6 space-y-6">
            <ResultOverviewCard response={response} onDownload={downloadCorrected} />

            <SummaryCard response={response} />

            {response.business_view?.operacao && (
              <OperationCard operation={response.business_view.operacao} />
            )}

            {allTitles.length > 0 && (
              <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-950">Títulos</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Consulte os detalhes da operação por título.
                    </p>
                  </div>

                  <div className="w-full lg:max-w-sm">
                    <input
                      value={titleQuery}
                      onChange={(e) => {
                        setTitleQuery(e.target.value);
                        setSelectedTitleIndex(0);
                      }}
                      placeholder="Buscar por documento, sacado ou cedente"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                  <TitlesTable
                    titles={filteredTitles}
                    selectedIndex={selectedTitleIndex}
                    onSelect={setSelectedTitleIndex}
                  />
                  <TitleDetailsCard title={selectedTitle} />
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">Pendências</h2>
              <p className="mt-1 mb-5 text-sm text-slate-600">
                Veja erros, avisos e correções identificadas no arquivo original.
              </p>
              <IssuesCard response={response} />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Dados técnicos</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Exiba apenas se precisar inspecionar a estrutura do arquivo.
                  </p>
                </div>

                <button
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  type="button"
                  onClick={() => setShowTechnicalData((prev) => !prev)}
                >
                  {showTechnicalData ? "Ocultar dados técnicos" : "Mostrar dados técnicos"}
                </button>
              </div>

              {showTechnicalData && (
                <div className="mt-6 space-y-6">
                  <GroupedCard response={response} />
                  <JsonCard response={response} />
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}