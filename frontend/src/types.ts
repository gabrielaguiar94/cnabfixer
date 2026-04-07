export type Severity = "warning" | "error" | "info" | string;
export type IssueAction = "auto_corrected" | "not_corrected" | string;

export interface Issue {
  line: number;
  field: string;
  positions: string;
  severity: Severity;
  action: IssueAction;
  from: unknown;
  to: unknown;
  reason: string;
}

export interface Summary {
  total_lines?: number;
  auto_corrected?: number;
  errors_not_corrected?: number;
  warnings?: number;
}

export interface ParsedField {
  raw: string;
  display: string;
  start: number;
  end: number;
  type: "num" | "alpha" | string;
}

export interface ParsedRecord {
  line_number: number;
  record_type: string;
  record_name: string;
  raw_line: string;
  fields: Record<string, ParsedField>;
  flat: Record<string, string>;
}

export interface ParsedGrouped {
  header: Record<string, string> | null;
  detalhes: Array<Record<string, string>>;
  trailer: Record<string, string> | null;
}

export interface ParsedData {
  layout: string;
  line_length: number;
  records: ParsedRecord[];
  grouped: ParsedGrouped;
}

export interface BusinessOperation {
  quantidade_titulos: number;
  total_valor_titulo: number;
  total_valor_presente: number;
  total_valor_abatimento: number;
  total_valor_pago: number;
  total_desagio: number;
}

export interface BusinessTitle {
  line_number?: number | null;
  numero_documento: string;
  numero_controle_participante: string;
  ocorrencia: string;
  sacado: string;
  tipo_inscricao_sacado: string;
  numero_inscricao_sacado: string;
  cedente_nome: string;
  cedente_cnpj: string;
  data_emissao: string;
  data_vencimento: string;
  valor_titulo: number;
  valor_presente: number;
  valor_abatimento: number;
  valor_pago: number;
  valor_desagio: number;
  endereco_completo: string;
  cep_sacado: string;
  especie_titulo: string;
  numero_termo_cessao: string;
}

export interface BusinessView {
  operacao: BusinessOperation;
  titulos: BusinessTitle[];
}

export interface ApiResponse {
  success: boolean;
  layout?: string;
  input_file?: string;
  output_file?: string;
  output_path?: string;
  summary?: Summary;
  issues?: Issue[];
  parsed?: ParsedData;
  business_view?: BusinessView;
}