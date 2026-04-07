import type { ApiResponse } from "../types";

interface Props {
  response: ApiResponse;
}

export function JsonCard({ response }: Props) {
  return (
    <section className="card">
      <h2>Resposta JSON completa</h2>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </section>
  );
}