from typing import Any, Dict, List


def only_digits(value: str) -> str:
    return "".join(ch for ch in (value or "") if ch.isdigit())


def cnab_money_to_decimal(value: str, decimals: int = 2) -> float:
    digits = only_digits(value)
    if not digits:
        return 0.0
    return int(digits) / (10 ** decimals)


def format_ddmmaa(value: str) -> str:
    value = (value or "").strip()
    if len(value) != 6 or not value.isdigit() or value == "000000":
        return value

    dd = value[0:2]
    mm = value[2:4]
    yy = value[4:6]

    year = int(yy)
    full_year = 2000 + year if year <= 69 else 1900 + year

    return f"{full_year:04d}-{mm}-{dd}"


def build_title_view(flat: Dict[str, str], line_number: int | None = None) -> Dict[str, Any]:
    valor_titulo = cnab_money_to_decimal(flat.get("valor_titulo", "0"))
    valor_presente = cnab_money_to_decimal(flat.get("valor_presente_parcela", "0"))
    valor_abatimento = cnab_money_to_decimal(flat.get("valor_abatimento", "0"))
    valor_pago = cnab_money_to_decimal(flat.get("valor_pago", "0"))

    valor_desagio = round(valor_titulo - valor_presente - valor_abatimento, 2)

    return {
        "line_number": line_number,
        "numero_documento": (flat.get("numero_documento", "") or "").strip(),
        "numero_controle_participante": (flat.get("numero_controle_participante", "") or "").strip(),
        "ocorrencia": (flat.get("identificacao_ocorrencia", "") or "").strip(),
        "sacado": (flat.get("nome_sacado", "") or "").strip(),
        "tipo_inscricao_sacado": (flat.get("tipo_inscricao_sacado", "") or "").strip(),
        "numero_inscricao_sacado": (flat.get("numero_inscricao_sacado", "") or "").strip(),
        "cedente_nome": (flat.get("cedente_nome", "") or "").strip(),
        "cedente_cnpj": (flat.get("cedente_cnpj", "") or "").strip(),
        "data_emissao": format_ddmmaa(flat.get("data_emissao_titulo", "")),
        "data_vencimento": format_ddmmaa(flat.get("data_vencimento_titulo", "")),
        "valor_titulo": round(valor_titulo, 2),
        "valor_presente": round(valor_presente, 2),
        "valor_abatimento": round(valor_abatimento, 2),
        "valor_pago": round(valor_pago, 2),
        "valor_desagio": valor_desagio,
        "endereco_completo": (flat.get("endereco_completo", "") or "").strip(),
        "cep_sacado": (flat.get("cep_sacado", "") or "").strip(),
        "especie_titulo": (flat.get("especie_titulo", "") or "").strip(),
        "numero_termo_cessao": (flat.get("numero_termo_cessao", "") or "").strip(),
    }


def summarize_titles(titulos: List[Dict[str, Any]]) -> Dict[str, Any]:
    quantidade_titulos = len(titulos)
    total_valor_titulo = round(sum(item.get("valor_titulo", 0.0) for item in titulos), 2)
    total_valor_presente = round(sum(item.get("valor_presente", 0.0) for item in titulos), 2)
    total_valor_abatimento = round(sum(item.get("valor_abatimento", 0.0) for item in titulos), 2)
    total_valor_pago = round(sum(item.get("valor_pago", 0.0) for item in titulos), 2)
    total_desagio = round(sum(item.get("valor_desagio", 0.0) for item in titulos), 2)

    return {
        "quantidade_titulos": quantidade_titulos,
        "total_valor_titulo": total_valor_titulo,
        "total_valor_presente": total_valor_presente,
        "total_valor_abatimento": total_valor_abatimento,
        "total_valor_pago": total_valor_pago,
        "total_desagio": total_desagio,
    }


def build_business_view(parsed: Dict[str, Any]) -> Dict[str, Any]:
    grouped = parsed.get("grouped", {})
    detalhes = grouped.get("detalhes", []) or []
    records = parsed.get("records", []) or []

    titulos: List[Dict[str, Any]] = []

    detalhe_line_numbers = [
        record.get("line_number")
        for record in records
        if record.get("record_type") == "1"
    ]

    for index, detalhe in enumerate(detalhes):
        line_number = detalhe_line_numbers[index] if index < len(detalhe_line_numbers) else None
        titulos.append(build_title_view(detalhe, line_number=line_number))

    operacao = summarize_titles(titulos)

    return {
        "operacao": operacao,
        "titulos": titulos,
    }