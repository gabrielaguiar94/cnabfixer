import { useMemo, useState } from "react";
import { SummaryCard } from "./components/SummaryCard";
import { IssuesCard } from "./components/IssuesCard";
import { GroupedCard } from "./components/GroupedCard";
import { JsonCard } from "./components/JsonCard";
import { OperationCard } from "./components/OperationCard";
import { TitlesTable } from "./components/TitlesTable";
import { TitleDetailsCard } from "./components/TitleDetailsCard";
import type { ApiResponse, BusinessTitle } from "./types";

const API_BASE = "http://localhost:8765";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number>(0);
  const [showTechnicalData, setShowTechnicalData] = useState<boolean>(false);

  const titles = response?.business_view?.titulos ?? [];
  const selectedTitle: BusinessTitle | null = useMemo(() => {
    if (!titles.length) return null;
    return titles[selectedTitleIndex] ?? titles[0];
  }, [titles, selectedTitleIndex]);

  const issueCount = response?.issues?.length ?? 0;
  const hasCorrectedFile = Boolean(response?.output_file);

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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/(\.\w+)?$/, "_CORRIGIDO.REM");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no download");
    }
  }

  function resetAll(): void {
    setFile(null);
    setResponse(null);
    setError("");
    setSelectedTitleIndex(0);
    setShowTechnicalData(false);
  }

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <div className="hero-badge">CNAB • Validação posicional</div>
          <h1>CNAB Fixer</h1>
          <p>
            Analise, corrija e visualize arquivos CNAB com foco em aderência de
            layout e leitura estruturada da operação.
          </p>
        </header>

        <section className="upload-card">
          <div className="upload-left">
            <span className="section-kicker">Entrada</span>
            <h2>Processar arquivo</h2>
            <p className="section-text">
              Envie um arquivo CNAB para validar regras de posição, corrigir o
              que for seguro e visualizar títulos da operação.
            </p>

            <label className="upload-dropzone" htmlFor="cnab-file">
              <input
                id="cnab-file"
                className="hidden-input"
                type="file"
                accept=".rem,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div className="upload-dropzone-title">
                {file ? "Arquivo selecionado" : "Clique para selecionar o arquivo"}
              </div>
              <div className="upload-dropzone-subtitle">
                {file ? file.name : "Formatos aceitos: .REM e .TXT"}
              </div>
            </label>

            <div className="toolbar">
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={loading}
                type="button"
              >
                {loading ? "Processando..." : "Processar arquivo"}
              </button>

              <button
                className="btn btn-secondary"
                onClick={resetAll}
                disabled={loading}
                type="button"
              >
                Limpar
              </button>

              {hasCorrectedFile && (
                <button
                  className="btn btn-secondary"
                  onClick={downloadCorrected}
                  disabled={loading}
                  type="button"
                >
                  Baixar corrigido
                </button>
              )}
            </div>

            {error && <div className="alert error">{error}</div>}
          </div>

          <div className="upload-right">
            <div className="quick-stat">
              <span className="quick-stat-label">Arquivo</span>
              <strong>{file?.name ?? "Nenhum arquivo carregado"}</strong>
            </div>

            <div className="quick-stat">
              <span className="quick-stat-label">Status</span>
              <strong>
                {loading
                  ? "Processando"
                  : response
                  ? "Arquivo processado"
                  : "Aguardando envio"}
              </strong>
            </div>

            <div className="quick-stat">
              <span className="quick-stat-label">Issues encontradas</span>
              <strong>{response ? issueCount : "-"}</strong>
            </div>

            <div className="quick-stat">
              <span className="quick-stat-label">Arquivo corrigido</span>
              <strong>{hasCorrectedFile ? "Disponível" : "Não gerado"}</strong>
            </div>
          </div>
        </section>

        {response && (
          <>
            <SummaryCard response={response} />

            {response.business_view?.operacao && (
              <OperationCard operation={response.business_view.operacao} />
            )}

            <IssuesCard response={response} />

            {titles.length > 0 && (
              <>
                <TitlesTable
                  titles={titles}
                  selectedIndex={selectedTitleIndex}
                  onSelect={setSelectedTitleIndex}
                />
                <TitleDetailsCard title={selectedTitle} />
              </>
            )}

            <section className="card">
              <div className="technical-header">
                <div>
                  <h2>Dados técnicos</h2>
                  <p className="muted no-margin">
                    Estrutura bruta e JSON completo para apoio técnico e futura integração.
                  </p>
                </div>

                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowTechnicalData((prev) => !prev)}
                >
                  {showTechnicalData ? "Ocultar dados técnicos" : "Mostrar dados técnicos"}
                </button>
              </div>

              {showTechnicalData && (
                <>
                  <GroupedCard response={response} />
                  <JsonCard response={response} />
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}