import re
from typing import Any, Dict, List, Tuple

from app.models.layout import LayoutSchema, LayoutField
from app.core.parser_cnab import get_record_type
from app.core.writer import ensure_line_length
from app.core.utils import is_valid_ddmmaa


def extract_field_value(line: str, field: LayoutField) -> str:
    return line[field.start - 1:field.end]


def positions_text(field: LayoutField) -> str:
    return f"{field.start}-{field.end}"


def validate_allowed_value(value: str, field: LayoutField) -> bool:
    if not field.allowed_values:
        return True
    return value in field.allowed_values


def validate_file_name(file_name: str, pattern: str | None) -> List[Dict[str, Any]]:
    if not pattern:
        return []

    if re.fullmatch(pattern, file_name.upper()):
        return []

    return [
        {
            "line": 0,
            "field": "__file_name__",
            "positions": "-",
            "severity": "warning",
            "action": "not_corrected",
            "from": file_name,
            "to": None,
            "reason": "Nome do arquivo fora do padrão esperado pelo layout",
        }
    ]


def validate_date_field(value: str, field: LayoutField) -> bool:
    if field.date_format == "DDMMAA":
        return is_valid_ddmmaa(value)
    return True


def apply_field_validations(
    line_number: int,
    original_value: str,
    field: LayoutField,
) -> List[Dict[str, Any]]:
    issues: List[Dict[str, Any]] = []
    value = "" if original_value is None else str(original_value)

    if field.required and not value.strip():
        issues.append(
            {
                "line": line_number,
                "field": field.name,
                "positions": positions_text(field),
                "severity": "error",
                "action": "not_corrected",
                "from": value,
                "to": None,
                "reason": "Campo obrigatório não preenchido",
            }
        )

    if field.allowed_values and not validate_allowed_value(value, field):
        issues.append(
            {
                "line": line_number,
                "field": field.name,
                "positions": positions_text(field),
                "severity": "error",
                "action": "not_corrected",
                "from": value,
                "to": None,
                "reason": f"Valor '{value}' não permitido no layout",
            }
        )

    if field.date_format and value.strip():
        if not validate_date_field(value, field):
            issues.append(
                {
                    "line": line_number,
                    "field": field.name,
                    "positions": positions_text(field),
                    "severity": "error",
                    "action": "not_corrected",
                    "from": value,
                    "to": None,
                    "reason": f"Data inválida no formato {field.date_format}",
                }
            )

    return issues


def post_validate_critical_positions(line_number: int, line: str) -> List[Dict[str, Any]]:
    issues: List[Dict[str, Any]] = []

    if get_record_type(line) != "1":
        return issues

    cedente_cnpj = line[380:394]  # 381-394
    if cedente_cnpj.strip():
        if len(cedente_cnpj) != 14 or not cedente_cnpj.isdigit():
            issues.append(
                {
                    "line": line_number,
                    "field": "cedente_cnpj",
                    "positions": "381-394",
                    "severity": "error",
                    "action": "not_corrected",
                    "from": cedente_cnpj,
                    "to": None,
                    "reason": "Campo crítico fora do posicionamento esperado",
                }
            )

    return issues


def validate_and_fix_lines(
    lines: List[str],
    layout: LayoutSchema,
) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, int]]:
    issues: List[Dict[str, Any]] = []

    summary = {
        "total_lines": len(lines),
        "auto_corrected": 0,
        "errors_not_corrected": 0,
        "warnings": 0,
    }

    validated_lines: List[str] = []

    for line_number, line in enumerate(lines, start=1):
        normalized_line = ensure_line_length(line, layout.line_length)
        validated_lines.append(normalized_line)

        record_type = get_record_type(normalized_line)

        if record_type not in layout.records:
            issues.append(
                {
                    "line": line_number,
                    "field": "__record_type__",
                    "positions": "1-1",
                    "severity": "error",
                    "action": "not_corrected",
                    "from": record_type,
                    "to": None,
                    "reason": f"Tipo de registro '{record_type}' não mapeado no layout",
                }
            )
            summary["errors_not_corrected"] += 1
            continue

        record_layout = layout.records[record_type]

        for field in record_layout.fields:
            original_value = extract_field_value(normalized_line, field)
            field_issues = apply_field_validations(
                line_number=line_number,
                original_value=original_value,
                field=field,
            )

            for item in field_issues:
                issues.append(item)
                if item["severity"] == "error":
                    summary["errors_not_corrected"] += 1
                else:
                    summary["warnings"] += 1

        critical_issues = post_validate_critical_positions(line_number, normalized_line)
        for item in critical_issues:
            issues.append(item)
            if item["severity"] == "error":
                summary["errors_not_corrected"] += 1
            else:
                summary["warnings"] += 1

    return validated_lines, issues, summary