import re
from typing import Any, Dict, List, Tuple

from app.models.layout import LayoutSchema, LayoutField
from app.core.parser_cnab import get_record_type
from app.core.corrector import normalize_field
from app.core.writer import replace_slice, ensure_line_length
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

    if field.allowed_values and not validate_allowed_value(original_value, field):
        issues.append(
            {
                "line": line_number,
                "field": field.name,
                "positions": positions_text(field),
                "severity": "error",
                "action": "not_corrected",
                "from": original_value,
                "to": None,
                "reason": f"Valor '{original_value}' não permitido no layout",
            }
        )

    if field.date_format and original_value.strip():
        if not validate_date_field(original_value, field):
            issues.append(
                {
                    "line": line_number,
                    "field": field.name,
                    "positions": positions_text(field),
                    "severity": "error",
                    "action": "not_corrected",
                    "from": original_value,
                    "to": None,
                    "reason": f"Data inválida no formato {field.date_format}",
                }
            )

    return issues


def renumber_lines(
    corrected_lines: List[str],
    layout: LayoutSchema,
) -> List[str]:
    out: List[str] = []

    for idx, line in enumerate(corrected_lines, start=1):
        record_type = get_record_type(line)
        line = ensure_line_length(line, layout.line_length)

        if record_type in ("0", "1"):
            line = replace_slice(line, 439, 444, str(idx).rjust(6, "0"))
        elif record_type == "9":
            line = replace_slice(line, 439, 444, str(len(corrected_lines)).rjust(6, "0"))

        out.append(line)

    return out


def rebuild_trailer_if_missing(lines: List[str], layout: LayoutSchema) -> Tuple[List[str], bool]:
    if lines and get_record_type(lines[-1]) == "9":
        return lines, False

    trailer = "9" + (" " * (layout.line_length - 1))
    trailer = replace_slice(trailer, 439, 444, str(len(lines) + 1).rjust(6, "0"))
    return lines + [trailer], True


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
    corrected_lines: List[str] = []
    issues: List[Dict[str, Any]] = []

    summary = {
        "total_lines": len(lines),
        "auto_corrected": 0,
        "errors_not_corrected": 0,
        "warnings": 0,
    }

    lines, trailer_created = rebuild_trailer_if_missing(lines, layout)
    if trailer_created:
        issues.append(
            {
                "line": len(lines),
                "field": "__trailer__",
                "positions": "1-444",
                "severity": "warning",
                "action": "auto_corrected",
                "from": None,
                "to": "TRAILER CRIADO",
                "reason": "Arquivo sem trailer; trailer criado automaticamente",
            }
        )
        summary["auto_corrected"] += 1
        summary["warnings"] += 1

    for line_number, line in enumerate(lines, start=1):
        record_type = get_record_type(line)

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
            corrected_lines.append(ensure_line_length(line, layout.line_length))
            continue

        record_layout = layout.records[record_type]
        corrected_line = ensure_line_length(line, layout.line_length)

        for field in record_layout.fields:
            original_value = extract_field_value(corrected_line, field)
            normalized_value = normalize_field(original_value, field)

            field_issues = apply_field_validations(
                line_number=line_number,
                original_value=original_value,
                field=field,
            )

            has_blocking_error = any(item["severity"] == "error" for item in field_issues)
            for item in field_issues:
                issues.append(item)
                if item["severity"] == "error":
                    summary["errors_not_corrected"] += 1
                else:
                    summary["warnings"] += 1

            if has_blocking_error:
                continue

            if original_value != normalized_value:
                if field.autocorrect:
                    corrected_line = replace_slice(corrected_line, field.start, field.end, normalized_value)
                    issues.append(
                        {
                            "line": line_number,
                            "field": field.name,
                            "positions": positions_text(field),
                            "severity": "warning",
                            "action": "auto_corrected",
                            "from": original_value,
                            "to": normalized_value,
                            "reason": "Campo normalizado conforme layout",
                        }
                    )
                    summary["auto_corrected"] += 1
                    summary["warnings"] += 1
                else:
                    issues.append(
                        {
                            "line": line_number,
                            "field": field.name,
                            "positions": positions_text(field),
                            "severity": "error",
                            "action": "not_corrected",
                            "from": original_value,
                            "to": normalized_value,
                            "reason": "Campo divergente do layout, mas sem correção automática",
                        }
                    )
                    summary["errors_not_corrected"] += 1

        critical_issues = post_validate_critical_positions(line_number, corrected_line)
        for item in critical_issues:
            issues.append(item)
            summary["errors_not_corrected"] += 1

        corrected_lines.append(corrected_line)

    corrected_lines = renumber_lines(corrected_lines, layout)
    summary["total_lines"] = len(corrected_lines)

    return corrected_lines, issues, summary