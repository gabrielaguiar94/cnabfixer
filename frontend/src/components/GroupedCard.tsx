import type { ApiResponse } from "../types";

interface Props {
  response: ApiResponse;
}

export function GroupedCard({ response }: Props) {
  const grouped = response.parsed?.grouped;

  if (!grouped) return null;

  return (
    <section className="card">
      <h2>Dados estruturados</h2>

      <div className="group-box">
        <h3>Header</h3>
        <pre>{JSON.stringify(grouped.header ?? {}, null, 2)}</pre>
      </div>

      <div className="group-box">
        <h3>Detalhes</h3>
        <pre>{JSON.stringify(grouped.detalhes ?? [], null, 2)}</pre>
      </div>

      <div className="group-box">
        <h3>Trailer</h3>
        <pre>{JSON.stringify(grouped.trailer ?? {}, null, 2)}</pre>
      </div>
    </section>
  );
}